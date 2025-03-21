import { IncomingMessage, ServerResponse } from "node:http";

export async function cachingMiddleware(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  console.log("From cache middleware");
  return false;
}
