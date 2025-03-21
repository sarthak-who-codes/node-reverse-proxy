import { IncomingMessage, ServerResponse } from "node:http";

export async function rateLimiterMiddleware(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
    console.log("From rate limiter middleware");
  return false;
}
