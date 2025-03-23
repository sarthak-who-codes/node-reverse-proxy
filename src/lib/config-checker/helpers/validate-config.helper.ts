import { configSchema, TConfigSchmea } from "../../../lib/zod/config.zod.js";

export async function validateConfig(file: string): Promise<TConfigSchmea> {
   return configSchema.parseAsync(JSON.parse(file));

}
