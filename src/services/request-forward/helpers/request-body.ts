import { IncomingMessage } from "node:http";

export function getStructuredRequest(req: IncomingMessage) {
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
