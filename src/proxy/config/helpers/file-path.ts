import path from "node:path";

export function getConfigPath(): string | undefined {
  // 0-> exact pathname of executable, 1-> JS file being executed, then other user passed configs
  try {
    const userArgs = process.argv.slice(2);
    const configArg = userArgs.find((str) => str.startsWith("--config="));

    if (!configArg) return undefined;

    const filePath = configArg.split("--config=")[1];
    const normalizedPath = path.normalize(filePath);

    if (normalizedPath === "") return undefined;

    return normalizedPath;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
