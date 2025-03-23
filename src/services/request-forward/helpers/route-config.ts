import { getRouteMap, TRouteDefinition } from "./route-map.js";

export function getRouteConfig(url: string): TRouteDefinition | null {
  const routeMap = getRouteMap();
  let routeValue: TRouteDefinition | null = null;

  if (!url) return null;

  for (const [key, value] of routeMap.entries()) {
    if (url.startsWith(key)) {
      if (routeValue === null || key.length > url.length) routeValue = value;
    }
  }

  return routeValue;
}