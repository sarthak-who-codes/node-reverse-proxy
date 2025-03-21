import { IncomingHttpHeaders } from "node:http";
import { TConfigSchmea } from "../../../lib/zod/config.zod.js";

export async function processHeader(header: IncomingHttpHeaders, config: TConfigSchmea) {
    const modifiedHeaders = {...header};
    

}