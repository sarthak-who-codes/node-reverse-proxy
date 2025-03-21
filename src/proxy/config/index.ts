import { isValidExtension } from "./helpers/fie-extension.js";
import { isFileExist } from "./helpers/file-check.js";
import { getConfigPath } from "./helpers/file-path.js";
import { validateConfig } from "./helpers/validate-config.helper.js";

export async function getValidatedConfig() {
  const configPath = getConfigPath();

  if (!configPath)
    throw new Error("Provided config path is not that of a valid type");

  const fileExist = await isFileExist(configPath);

  if (!fileExist.exist)
    throw new Error("File with provided path does not exist");

  if (!isValidExtension(configPath))
    throw new Error("File s not of valid configuration type");

  return await validateConfig(fileExist.fileData);


}
