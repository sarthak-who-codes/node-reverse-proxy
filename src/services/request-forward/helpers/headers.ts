import { IncomingMessage } from "node:http";
import { TRouteDefinition } from "./route-map.js";

export function transformHeaders(
  headers: IncomingMessage["headers"],
  routeDefinition: TRouteDefinition
) {
  console.log(headers);
  let newHeaders = { ...routeDefinition.headers.add, ...headers };
  console.log("Header addition:");
  console.log(newHeaders);
  newHeaders = { ...newHeaders, ...routeDefinition.headers.modify };
  // console.log("Header modification:");
  // console.log(newHeaders);
  routeDefinition.headers.remove?.forEach((key) => {
    delete newHeaders[key];
  });
  // console.log("After deleton: ");
  // console.log(newHeaders);
  // console.log("------------------------");
  // console.log("Final obejct: ");
  // console.log(newHeaders);

  return newHeaders;
}
