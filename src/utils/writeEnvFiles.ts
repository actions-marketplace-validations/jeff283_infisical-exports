/**
 * Writes .env files for each folder path containing its associated secrets
 * Uses Bun.write() for optimized file I/O performance
 */
export async function writeEnvFiles(
  secretsByPath: Map<string, Array<{ key: string; value: string }>>,
  folderAppend: string
) {
  for (const [path, secrets] of secretsByPath) {
    // Format secrets as KEY=VALUE pairs, one per line
    const envContent = secrets
      .map((secret) => {
        const escapedValue = escapeEnvValue(secret.value);
        return `${secret.key}=${escapedValue}`;
      })
      .join("\n");

    const envFilePath = `${folderAppend}${path}/.env`;

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
