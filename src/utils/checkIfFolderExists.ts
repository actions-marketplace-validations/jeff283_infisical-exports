import { stat } from "node:fs/promises";

/**
 * Checks if a directory exists at the given path
 */
export async function checkIfFolderExists(folderPath: string) {
  return await stat(folderPath)
    .then(() => true)
    .catch(() => false);
}
