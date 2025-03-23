# Reverse Proxy in NodeJS

## Avalilable Features

- Load balancing
- Header manipulation
- Caching
- Rate limiting
- Logging

### Upcoming Features

- SSL termination (planning)
- Configuration update with restarting (wip)
- YAML support(wip)

## Getting started

1. **Clone repo:**

```bash
    git clone git@github.com:sarthak-who-codes/node-reverse-proxy.git && cd $_
```

2. **Start the server:**

```bash
    pnpm build && pnpm start --config="/path/to/your/config.json"
```

## Configuration

Support JSON based configuration file.

### Configuration overview

Required -> ✅

Optional -> ❌

```plaintext
config
├── server
│   ├── port (Number) ✅
│   ├── host (String) ✅
│   ├── timeout (Number) ❌ (default: 60000)
│   ├── maxRequestSize (Enum) ✅
│
├── logging (Object) ❌
│   ├── enabled (Boolean) ❌
│   ├── level (Enum) ❌
│   ├── file (String) ❌
│
├── rateLimiting (Object) ❌
│   ├── enabled (Boolean) ❌
│   ├── maxRequests (Number) ❌
│   ├── timeWindowMs (Number) ❌
│
├── loadBalance (Enum) ❌ (Enum: "round_robin", "least_traffic")
│
├── cache (Object) ❌
│   ├── enabled (Boolean) ✅ (default: true)
│   ├── ttl (Number) ✅ (default: 60000)
│   ├── methods (Array<Enum>) ✅
│
├── headers (Object) ❌
│   ├── add (Record<String, String>) ❌
│   ├── remove (Array<String>) ❌
│   ├── modify (Record<String, String>) ❌
│
└── routes (Array<Object>) ✅
    ├── name (String) ✅
    ├── path (String) ✅
    ├── targets (Array<String|Object>) ✅
    │   ├── host (String) ✅
    │   ├── port (Number) ✅
    │   ├── protocol (Enum) ✅
    │   ├── weight (Number) ❌ (default: 1)
    ├── rateLimiting (Object) ❌ ↪ **Overrides root-level if present**
    ├── loadBalance (Enum) ❌ ↪ **Overrides root-level if present**
    ├── headers (Object) ❌ ↪ **Overrides root-level if present**
    ├── cache (Object) ❌ ↪ **Overrides root-level if present**

```

### Example `JSON` configuration file

```json
{
  "server": {
    "port": 8080,
    "host": "0.0.0.0",
    "ssl": {
      "enabled": false,
      "cert": "/path/to/cert.pem",
      "key": "/path/to/key.pem"
    },
    "timeout": 30000,
    "maxRequestSize": "10mb"
  },
  "logging": {
    "enabled": true,
    "level": "info",
    "file": "logs/proxylogs.txt"
  },
  "rateLimiting": {
    "enabled": true,
    "maxRequests": 10,
    "timeWindow": 60
  },
  "loadBalance": "round_robin",
  "routes": [
    {
      "name": "api-service",
      "path": "/api",
      "targets": [
        { "host": "localhost", "port": 9000, "weight": 3 },
        { "host": "localhost", "port": 9001, "weight": 1 },
        "http://localhost:9000"
      ],
      "loadBalance": "least_traffic",
      "headers": {
        "add": {
          "X-Proxy-By": "MyProxy"
        },
        "remove": ["X-Powered-By"]
      }
    },
    {
      "name": "more-detailed-api",
      "path": "/api/v3",
      "targets": ["http://localhost:9000", "http://localhost:9001"],
      "headers": {
        "add": {
          "X-Frame-Options": "DIFFERENTORIGIN"
        }
      }
    },
    {
      "name": "frontend",
      "path": "/",
      "targets": [
        { "host": "localhost", "port": 9000, "weight": 2 },
        { "host": "localhost", "port": 9001, "weight": 1 },
        { "host": "localhost", "port": 9002, "weight": 4 },
        { "host": "localhost", "port": 9003, "weight": 3 },
        { "host": "localhost", "port": 9004, "weight": 2 },
        { "host": "localhost", "port": 9005, "weight": 3 },
        { "host": "localhost", "port": 9006, "weight": 1 }
      ],
      "headers": {
        "add": {
          "X-Frame-Options": "SAMEORIGIN"
        },
        "modify": {
          "user-agent": "Mozilla/5.0"
        }
      }
    }
  ]
}
```

### Important notes

1. Precedence order of fields of `header` -> `remove` > `modify` > `add`.
2. All time related fileds are taken in milisecods.
3. Route matching uses longest match method.
4. Absolute pathes have to be provided.
