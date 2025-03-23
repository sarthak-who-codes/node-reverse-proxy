import { createProxyServer } from "./server.js";
import { getValidatedConfig } from "./lib/config-checker/index.js";
import { initializeRouteMap } from "./services/request-forward/helpers/route-map.js";
import { initializeLogger } from "./lib/logger/pino.js";

async function main() {
  try {
    const validatedConfig = await getValidatedConfig();
    initializeLogger("info", validatedConfig.logging?.file ?? "logs/logs.txt");

    initializeRouteMap(validatedConfig);

    await createProxyServer(validatedConfig);
  } catch (err) {
    console.log(err);

    throw err;
  }
}

main();
