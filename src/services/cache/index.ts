import NodeCache from "node-cache";
import { IncomingMessage, OutgoingHttpHeader, ServerResponse } from "node:http";
import { OutgoingHttpHeaders } from "node:http2";

type TCache = {
  headers: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined;
  statusText: string;
  body: string;
};

const nodeCache = new NodeCache({ stdTTL: 60 });

export function cacheMiddleware(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
): boolean {
  const cacheKey = generateCacheKey(req);
  const cachedData = nodeCache.get<TCache>(cacheKey);

  if (cachedData) {
    console.log("Cache hit 💥");
    res.writeHead(200, cachedData.statusText, cachedData.headers);
    const responseBody = JSON.parse(cachedData.body);
    res.end(
      typeof responseBody === "string"
        ? responseBody
        : JSON.stringify(responseBody)
    );

    return true;
  }

  console.log("Cache not found ❌");

  return false;
}

export function setCache(
  clientReq: IncomingMessage,
  {
    upstreamResBody,
    upstreamResHeaders,
    upstreamResStatusText,
  }: {
    upstreamResHeaders: TCache["headers"];
    upstreamResBody: string;
    upstreamResStatusText: string;
  }
): void {
  const cacheKey = generateCacheKey(clientReq);
  console.log("Setting cache 💪🏻");
  nodeCache.set<TCache>(cacheKey, {
    body: upstreamResBody,
    statusText: upstreamResStatusText,
    headers: upstreamResHeaders,
  });

  console.log("Cache set 🧨");
}

function generateCacheKey(req: IncomingMessage) {
  return `${req.method}-${req.url}-${req.headers["accept-encoding"] ?? ""}-${
    req.headers["user-agent"] ?? ""
  }`;
}
