import { array, boolean, optional, string, z } from "zod";

/**
 * <---------------------Missing features------------------------->
 * 
 * <-------------Heathcheck---------->
 * "healthCheck": {
        "path": "/health",
        "interval": 10000,
        "timeout": 2000,
        "unhealthyThreshold": 3,
        "healthyThreshold": 2
      },     * Caching
 
* <--------------Auth-------------->
* "auth": {
        "enabled": false,
        "type": "basic",
        "users": [{ "username": "admin", "password": "secret" }]
      }

* <-------------Caching------------>
* "cache": {
        "enabled": true,
        "ttl": 300,
        "methods": ["GET"],
        "maxSize": "100mb"
      }

* <------------Rate Limiting------>
* "rateLimiting": {
        "enabled": true,
        "maxRequests": 100,
        "timeWindow": 60
      },
 */

export const rateLimitSchema = z.object({
  enabled: z.boolean().default(false),
  maxRequests: z.number().max(1000000).min(0).default(1000000).optional(),
  timeWindowMs: z
    .number()
    .max(24 * 60 * 60 * 1000)
    .min(25)
    .default(60 * 1000)
    .optional(),
});

export const headerSchema = z.object({
  add: z.record(z.string(), z.string()).optional(),
  remove: z.array(string()).optional(),
  modify: z.record(z.string(), z.string()).optional(),
});

export const targetServerSchema = z
  .object({
    host: z.string({ message: "Host is missing in target config" }),
    port: z
      .number({ message: "Port number missing in target config" })
      .optional(),
    protocol: z.enum(["http", "https"]).optional(),
    weight: z.number().default(1).optional(),
  })
  .or(z.string({ message: "Target url is missing" }));

export const cacheSchema = z.object({
  enabled: z.boolean(),
  ttl: z.number().min(100),
  methods: z.array(z.enum(["GET", "POST", "PUT", "DELETE", "OPTIONS"])),
  maxSize: z.enum([
    "1mb",
    "2mb",
    "3mb",
    "4mb",
    "5mb",
    "7mb",
    "10mb",
    "12mb",
    "15mb",
    "20mb",
    "25mb",
    "30mb",
    "40mb",
    "50mb",
  ]),
});
export const routeSchema = z.object({
  name: z.string().min(1),
  path: z.string().regex(/^\/(\*|[\w\-./]*)(\?.*)?$/, {
    message:
      "Invalid relative URL. It must start with '/' and can optionally include '*' or query parameters.",
  }),
  targets: z.array(targetServerSchema).or(targetServerSchema),
  rateLimiting: rateLimitSchema.optional(),
  loadBalance: z
    .enum(["round_robin", "least_traffic"], {
      message: "Load balancing algorithm is missing or not available",
    })
    .optional(),
  headers: headerSchema.optional(),
  cache: cacheSchema.optional(),
});

export const configSchema = z.object({
  server: z.object({
    port: z
      .number({ message: "Port in missing which is a required field" })
      .min(0)
      .max(65535),
    host: z.string().min(1),
    ssl: z
      .object({
        enabled: z.boolean(),
        cert: z.string(),
        key: z.string(),
      })
      .optional(),
    timeout: z.number().default(60 * 1000),
    maxRequestSize: z.enum([
      "1mb",
      "2mb",
      "3mb",
      "4mb",
      "5mb",
      "7mb",
      "10mb",
      "12mb",
      "15mb",
      "20mb",
      "25mb",
      "30mb",
      "40mb",
      "50mb",
    ]),
  }),
  defaultProtocol: z.enum(["http", "https"]).default("http"),
  logging: z.object({
    enabled: z.boolean(),
    level: z.enum(["info", "warn", "error"]),
    file: z.string().optional(),
  }),
  loadBalance: z
    .enum(["round_robin", "least_traffic"], {
      message: "Load balancing algorithm is missing or not available",
    })
    .optional(),
  cache: cacheSchema.optional(),
  rateLimiting: rateLimitSchema.optional(),
  headers: headerSchema.optional(),
  routes: z.array(routeSchema),
});

export type TConfigSchmea = z.infer<typeof configSchema>;
