import { createProxyServer } from "./proxy/server/server.js";
import { getValidatedConfig } from "./proxy/config/index.js";

async function main() {
  try {
    const validatedConfig = await getValidatedConfig();

    await createProxyServer(validatedConfig);
  } catch (err) {
    console.log(err);

    throw err;
  }
}

main();
