import { IncomingMessage } from "node:http";

export function getRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      let body = "";
      req.on("data", (chunks) => (body += chunks));
      req.on("end", () => resolve(body));
    } catch (error) {
      reject(error);
    }
  });
}
