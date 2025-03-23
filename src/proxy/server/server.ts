import http from "node:http";
import { TConfigSchmea } from "../../lib/zod/config.zod.js";
import { forwadingMiddleware } from "../../services/request-forward/index.js";
import { getLogger } from "../../lib/logger/pino.js";

export async function createProxyServer(config: TConfigSchmea) {
  const logger = getLogger();
  try {
    const httpServer = await createHttpServer(config.server.port);
    httpServer.on("request", async (req, res) => {
      try {
        await forwadingMiddleware(req, res, config);
        return;
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
