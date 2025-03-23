import { createProxyServer } from "./proxy/server/server.js";
import { getValidatedConfig } from "./proxy/config/index.js";
import { initializeRouteMap } from "./services/request-forward/helpers/route-map.js";
import { initializeLogger } from "./lib/logger/pino.js";

async function main() {
  try {
    const validatedConfig = await getValidatedConfig();
    initializeLogger("info");

    initializeRouteMap(validatedConfig);

    await createProxyServer(validatedConfig);
  } catch (err) {
    console.log(err);

    throw err;
  }
}

main();
