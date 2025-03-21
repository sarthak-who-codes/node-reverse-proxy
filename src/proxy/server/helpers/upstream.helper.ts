import { TConfigSchmea } from "../../../lib/zod/config.zod.js";

export function decidePath(
  reqPath: string | null | undefined,
  routes: { path: string }[]
): { path: string; index: number } | null {
    if(!reqPath) return null;
  let decidedPath: { path: string; index: number } | null = null;

  for (const [index, route] of routes.entries()) {
    if (reqPath.startsWith(route.path)) {
      if (decidedPath === null || route.path.length > decidePath.length)
        decidedPath = { path: route.path, index };
    }
  }

  return decidedPath;
}

export function decideUpstreamServer(routeIndex: number, config: TConfigSchmea) {
  
}