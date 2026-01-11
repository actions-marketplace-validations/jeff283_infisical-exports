import { checkIfFolderExists } from "@/utils/checkIfFolderExists";

/**
 * Writes .env files for each folder path containing its associated secrets
 * Only writes to folders that exist, logs warnings for missing folders
 * Uses Bun.write() for optimized file I/O performance
 */
export async function writeEnvFiles(
  secretsByPath: Map<string, Array<{ key: string; value: string }>>,
  folderAppend: string
) {
  for (const [path, secrets] of secretsByPath) {
    // Build folder path and env file path, handling empty folderAppend and root path cases
    let folderPath: string | null = null;
    let envFilePath: string;

    if (folderAppend === "") {
      if (path === "/") {
        // Root path: write directly to .env in current directory (no folder needed)
        envFilePath = ".env";
        folderPath = null; // No folder to check/create
      } else {
        // Other paths: use relative paths
        folderPath = path.slice(1); // Remove leading slash
        envFilePath = `${folderPath}/.env`;
      }
    } else {
      // When folderAppend is provided, prepend it and handle root path
      const normalizedPath = path === "/" ? "" : path;
      folderPath = `${folderAppend}${normalizedPath}`;
      envFilePath = `${folderPath}/.env`;
    }

    // Check if folder exists before writing (skip check for root path when folderAppend is empty)
    if (folderPath !== null) {
      const folderExists = await checkIfFolderExists(folderPath);
      if (!folderExists) {
        console.warn(
          `Warning: Folder ${folderPath} does not exist. Skipping ${secrets.length} secrets.`
        );
        continue;
      }
    }

    // Format secrets as KEY=VALUE pairs, one per line
    const envContent = secrets
      .map((secret) => {
        const escapedValue = escapeEnvValue(secret.value);
        return `${secret.key}=${escapedValue}`;
      })
      .join("\n");

    try {
      await Bun.write(envFilePath, envContent);
      console.log(`Wrote ${secrets.length} secrets to ${envFilePath}`);
    } catch (error) {
      console.error(`Error writing .env file ${envFilePath}:`, error);
    }
  }
}

/**
 * Escapes environment variable values according to .env file format rules
 * Wraps values in quotes if they contain special characters, spaces, or newlines
 * Properly escapes quotes and backslashes within quoted values
 */
export function escapeEnvValue(value: string): string {
  // Check if value requires quoting (contains special chars, spaces, or starts with number)
  if (
    value.includes(" ") ||
    value.includes("=") ||
    value.includes("#") ||
    value.includes("$") ||
    value.includes("`") ||
    value.includes('"') ||
    value.includes("'") ||
    value.includes("\n") ||
    value.includes("\r") ||
    /^\d/.test(value) ||
    value === ""
  ) {
    // Escape backslashes and double quotes, then wrap in double quotes
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}
