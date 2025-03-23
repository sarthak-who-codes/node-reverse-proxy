import { IncomingMessage, ServerResponse } from "node:http";
import { getRequestBody } from "./helpers/request-body.js";
import { Readable } from "node:stream";
import { cacheMiddleware, setCache } from "../cache/index.js";
import { LeastConnection } from "./helpers/load-balance/least-connection.js";
import { rateLimiterMiddleware } from "../rate-limit/index.js";
import { logEvents } from "../../lib/logger/pino.js";
import { TConfigSchmea } from "../../lib/zod/config.zod.js";
import { getRouteConfig } from "./helpers/route-config.js";
import { transformHttpHeaders } from "./helpers/headers.js";

export async function forwadingMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  config: TConfigSchmea
): Promise<undefined> {
  if (!req.url) {
    res.writeHead(500);
    res.end("Request url not founud");
    return;
  }

  const routeDefinition = getRouteConfig(req.url);

  if (!routeDefinition) {
    res.writeHead(502);
    res.end("502: Bad gateway");
    return;
  }

  if (routeDefinition.rateLimit) {
    if (
      rateLimiterMiddleware(
        req,
        res,
        routeDefinition.rateLimit.maxRequests,
        routeDefinition.rateLimit.timeWindowMs
      ) === false
    ) {
      return;
    }
  }

  if (routeDefinition.cache.enabled) {
    if (cacheMiddleware(req, res)) return;
  }

  // console.log(routeDefinition);
  const reqBody = await getRequestBody(req);
  const serverUrl = routeDefinition.lbInstance.getNextServer();

  if (!serverUrl) {
    res.writeHead(502);
    res.end("502: Upstream url not found");
    return;
  }

  const upstreamResponse = await fetch(serverUrl + req.url, {
    method: req.method,
    headers: transformHttpHeaders(req.headers),
    body: req.method !== "GET" && req.method !== "OPTIONS" ? reqBody : null,
  });

  if (routeDefinition.lbInstance instanceof LeastConnection) {
    routeDefinition.lbInstance.releaseServer(serverUrl);
  }

  // Cloning is needed as readable streams can be read only once
  const clonedUpstreamRes = upstreamResponse.clone();
  let upstreamResBody = undefined;

  if (
    upstreamResponse.ok &&
    routeDefinition.cache.enabled &&
    routeDefinition.cache.methods.includes(req.method as any)
  ) {
    const contentType = clonedUpstreamRes.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      upstreamResBody = await clonedUpstreamRes.json();
    } else {
      upstreamResBody = await clonedUpstreamRes.text(); // Handle non-JSON responses
    }

    setCache(req, {
      upstreamResBody: JSON.stringify(upstreamResBody),
      upstreamResHeaders: Object.fromEntries(
        clonedUpstreamRes.headers.entries()
      ),
      upstreamResStatusText: clonedUpstreamRes.statusText,
    });
  }

  const upstreamHeaders = Object.fromEntries(
    upstreamResponse.headers.entries()
  );

  res.writeHead(
    upstreamResponse.status,
    upstreamResponse.statusText,
    upstreamHeaders
  );

  upstreamResponse.body
    ? Readable.from(upstreamResponse.body).pipe(res)
    : res.end();

  if (config.logging) {
    logEvents(
      req,
      res,
      reqBody,
      upstreamResBody,
      upstreamHeaders,
      config.logging.level
    );
  }

  return;
}
