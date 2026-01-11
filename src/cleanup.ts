import * as core from "@actions/core";
import { readdir, readFile, stat, unlink } from "node:fs/promises";

interface EnvLocation {
  secretPath: string;
  envFilePath: string;
  secretCount: number;
  secretKeys: string[];
}

interface LocationsData {
  totalFiles: number;
  folderAppend: string;
  writtenAt: string;
  locations: EnvLocation[];
}

/**
 * Finds the exact env-locations JSON file in the current directory
 * Uses GitHub Actions core to report errors if the file is not found
 */
async function findLocationsFile(): Promise<string | null> {
  const exactFileName = "env-locations-91373033.json";
  try {
    const files = await readdir(".");
    const fileExists = files.includes(exactFileName);
    if (!fileExists) {
      const errorMessage = `Required locations file '${exactFileName}' not found in current directory`;
      core.error(errorMessage);
      core.setFailed(errorMessage);
      return null;
    }
    return exactFileName;
  } catch (error) {
    const errorMessage = `Error reading directory: ${error}`;
    core.error(errorMessage);
    core.setFailed(errorMessage);
    return null;
  }
}

/**
 * Reads and parses the locations JSON file
 */
async function readLocationsFile(
  filePath: string
): Promise<LocationsData | null> {
  try {
    try {
      await stat(filePath);
    } catch {
      core.warning(`Locations file ${filePath} does not exist`);
      return null;
    }
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as LocationsData;
  } catch (error) {
    core.error(`Error reading locations file ${filePath}: ${error}`);
    return null;
  }
}

/**
 * Deletes a file if it exists
 */
async function deleteFile(filePath: string): Promise<boolean> {
  try {
    try {
      await stat(filePath);
    } catch {
      return false;
    }
    await unlink(filePath);
    return true;
  } catch (error) {
    core.error(`Error deleting file ${filePath}: ${error}`);
    return false;
  }
}

/**
 * Main cleanup function that deletes all .env files listed in the locations JSON
 * and optionally deletes the locations JSON file itself
 */
async function postCleanup() {
  try {
    core.info("Starting cleanup of .env files...");

    // Find the exact locations JSON file (reports error via core if not found)
    const locationsFilePath = await findLocationsFile();
    if (!locationsFilePath) {
      // Error already reported by findLocationsFile
      return;
    }

    core.info(`Found locations file: ${locationsFilePath}`);

    // Read the locations data
    const locationsData = await readLocationsFile(locationsFilePath);
    if (!locationsData) {
      const errorMessage = "Could not read locations file. Skipping cleanup.";
      core.error(errorMessage);
      core.setFailed(errorMessage);
      return;
    }

    core.info(`Found ${locationsData.locations.length} .env files to delete`);

    // Delete all .env files listed in the locations
    let deletedCount = 0;
    let failedCount = 0;

    for (const location of locationsData.locations) {
      const envFilePath = location.envFilePath;
      const deleted = await deleteFile(envFilePath);
      if (deleted) {
        core.info(`Deleted: ${envFilePath}`);
        deletedCount++;
      } else {
        core.warning(`File not found or could not be deleted: ${envFilePath}`);
        failedCount++;
      }
    }

    // Delete the locations JSON file itself
    const locationsFileDeleted = await deleteFile(locationsFilePath);
    if (locationsFileDeleted) {
      core.info(`Deleted locations file: ${locationsFilePath}`);
    }

    core.info(
      `Cleanup completed. Deleted ${deletedCount} .env files${
        failedCount > 0 ? `, ${failedCount} failed` : ""
      }`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.error(`Cleanup failed: ${errorMessage}`);
    core.setFailed(`Cleanup failed: ${errorMessage}`);
  }
}

postCleanup();
