import { IncomingMessage, ServerResponse } from "node:http";
import { pino, Logger } from "pino";

let logger: Logger | undefined = undefined;

export function initializeLogger(
  logLevel: "info" | "debug" | "warn" | "error" | "fatal" | "silent" | "trace",
  destinationPath: string
): Logger {
  if (logger) return logger;

  logger = pino(
    {
      level: logLevel,
    },
    pino.destination({
      dest: destinationPath,
    })
  );

  return logger;
}

export function getLogger() {
  if (!logger) {
    return initializeLogger("info", "logs.txt");
  }

  return logger;
}

export function logEvents(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  reqBody: string,
  resBody: string,
  resHeaders: Record<string, string>,
  logLevel: "info" | "debug" | "warn" | "error" | "fatal" | "silent" | "trace"
) {
  const start = Date.now();
  const logger = initializeLogger(logLevel, "logs.txt");

  res.on("finish", () => {
    logger.info({
      req: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        remoteAddress: req.socket.remoteAddress,
        remotePort: req.socket.remotePort,
        requestBody: reqBody,
      },
      res: {
        method: req.method,
        headers: resHeaders,
        url: req.url,
        status: res.statusCode,
        responseBody: resBody,
      },
      duration: `${Date.now() - start}ms`,
    });
  });
}
