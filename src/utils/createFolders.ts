import * as core from "@actions/core";
import { checkIfFolderExists } from "@/utils/checkIfFolderExists";
import { mkdir } from "node:fs/promises";

/**
 * Creates all required directories recursively
 * Skips creation if directory already exists
 */
export async function createFolders(folderPaths: string[]) {
  for (const folderPath of folderPaths) {
    if (await checkIfFolderExists(folderPath)) {
      core.info(`Folder ${folderPath} already exists`);
    } else {
      await mkdir(folderPath, { recursive: true }).catch((error) => {
        core.error(`Error creating folder ${folderPath}: ${error}`);
      });
      core.info(`Folder ${folderPath} created`);
    }
  }
}
