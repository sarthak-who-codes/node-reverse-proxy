import { IncomingMessage, ServerResponse } from "node:http";

export async function forwadingMiddleware(
  req: IncomingMessage,
  res: ServerResponse
): Promise<undefined> {
  return;
}
