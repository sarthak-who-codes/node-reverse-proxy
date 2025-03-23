import { IncomingMessage, ServerResponse } from "node:http";

const rateLimiter = new Map<string, { count: number; startTime: number }>();

export function rateLimiterMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  reqLimit: number,
  windowMs: number
): boolean {
  const clientIp = req.socket.remoteAddress;

  if (!clientIp) {
    res.writeHead(502);
    res.end("Client ip not found");
    return false;
  }

  const clientData = rateLimiter.get(clientIp);
  const currentTime = Date.now();

  if (clientData) {
    console.log(reqLimit)
    console.log(clientData);
    if (currentTime - clientData.startTime > windowMs) {
      clientData.count = 1;
      clientData.startTime = currentTime;
    } else {
      clientData.count += 1;
    }

    if (clientData.count > reqLimit) {
      console.log(`IP: ${clientIp} has been blocked 👀`);
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Too many requests. Please try again later." })
      );
      return false;
    }
  } else {
    rateLimiter.set(clientIp, { count: 1, startTime: currentTime });
  }

  return true;
}
