export function isValidExtension(filePath: string): boolean {
  const extension = filePath.split(".").pop();

  if (
    !extension ||
    (extension !== "yaml" && extension !== "yml" && extension !== "json")
  )
    return false;

  return true;
}
