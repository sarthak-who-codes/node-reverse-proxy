import { z } from "zod";
import {
  cacheSchema,
  headerSchema,
  rateLimitSchema,
  TConfigSchmea,
} from "../lib/zod/config.zod.js";

export function prepareRouteMap(
  config: TConfigSchmea
): Map<string, TRouteMapValue> {
  const mappedRoutes = new Map();

  for (const route of config.routes) {
    const obj = transformObject(route, config);
    mappedRoutes.set(route.path, obj);
  }

  console.log(mappedRoutes);
  console.log("Route map preparation complete 🚀")

  return mappedRoutes;
}

const transformObject = (
  route: TConfigSchmea["routes"][0],
  config: TConfigSchmea
): TRouteMapValue => {
  // console.log("--------------------")
  // console.log("Config load balancing algo: " + config.loadBalance);
  // console.log("Route load balancing algo: " + route.loadBalance);
  // console.log("--------------------")
  
  return {
    route: route.path,
    loadBalance: route.loadBalance ?? config.loadBalance ?? "least_traffic",
    upstreams: prepareUpstreamUrls(route.targets, config),
    headers: prepareHeaders(route.headers, config.headers),
  };
};

function prepareUpstreamUrls(
  upstreams: TConfigSchmea["routes"][0]["targets"],
  config: TConfigSchmea
): TRouteMapValue["upstreams"] {
  const upstreamServers: TRouteMapValue["upstreams"] = [];

  //<-----------Upstream Urls-------------------->
  if (Array.isArray(upstreams)) {
    upstreams.forEach((upstream) => {
      if (typeof upstream === "string") {
        if (upstream.startsWith("http://") || upstream.startsWith("https://")) {
          upstreamServers.push({ url: upstream, weight: 1 });
        } else {
          const linkWithoutProtocol =
            upstream.split("//").length === 1
              ? upstream
              : upstream.split("//")[1];
          upstreamServers.push({
            url: config.defaultProtocol + "://" + linkWithoutProtocol,
            weight: 1,
          });
        }
      } else {
        const serverLink =
          (upstream.protocol ?? config.defaultProtocol) +
          "://" +
          upstream.host +
          (upstream.port ? ":" + upstream.port : "");
        upstreamServers.push({ url: serverLink, weight: upstream.weight ?? 1 });
      }
    });
  }
  return upstreamServers;
}

function prepareHeaders(
  routeHeader: TConfigSchmea["routes"][0]["headers"],
  configHeader: TConfigSchmea["headers"]
): NonNullable<TConfigSchmea["headers"]> {
  if (!routeHeader && !configHeader) {
    return {
      add: {},
      remove: [],
      modify: {},
    };
  } else if (!routeHeader && configHeader) {
    return configHeader;
  } else if (routeHeader && !configHeader) {
    return routeHeader;
  } else if (routeHeader && configHeader) {
    return {
      add: { ...configHeader.add, ...routeHeader.add },
      remove: [
        ...new Set([
          ...(configHeader.remove || []),
          ...(routeHeader.remove || []),
        ]),
      ], //chatGPT
      modify: { ...configHeader.modify, ...routeHeader.modify },
    };
  }

  return {
    add: {},
    remove: [],
    modify: {},
  };
}

const ZodSchema = z.object({
  route: z.string().nonempty(),
  upstreams: z.array(
    z.object({
      url: z.string().url(),
      weight: z.number().min(1),
    })
  ),
  headers: headerSchema,
  loadBalance: z.enum(["round_robin", "least_traffic"]),
  healthCheck: z
    .object({
      route: z.string(),
      responseStatus: z.number(),
      timeout: z.number(),
      interval: z.number(),
    })
    .optional(),
  cache: cacheSchema.omit({ enabled: true }).optional(),
  rateLimit: rateLimitSchema.omit({ enabled: true }).optional(),
});

export type TRouteMapValue = z.infer<typeof ZodSchema>;