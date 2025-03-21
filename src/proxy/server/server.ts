import http from "node:http";
import { TConfigSchmea } from "../../lib/zod/config.zod.js";
import { rateLimiterMiddleware } from "../../services/rate-limit/index.js";
import { cachingMiddleware } from "../../services/cache/index.js";
import { forwadingMiddleware } from "../../services/request-forward/index.js";

export async function createProxyServer(config: TConfigSchmea) {
  try {
    const httpServer = await createHttpServer(config.server.port);
    httpServer.on("request", async (req, res) => {
      try {

        if (await rateLimiterMiddleware(req, res)) return;

        if (await cachingMiddleware(req, res)) return;

        await forwadingMiddleware(req, res);
        res.writeHead(200);
        res.end("Head");
      } catch (error) {
        console.log(error);
        res.writeHead(500);
        res.end(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function createHttpServer(port: number) {
  const httpServer = http.createServer();

  httpServer.listen(port, () => {
    console.log(`Http server started on port: ${port} 🚀`);
  });

  return httpServer;
}
