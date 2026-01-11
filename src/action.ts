import { InfisicalSDK } from "@infisical/sdk";
import { createFolders } from "@/utils/createFolders";
import { writeEnvFiles } from "@/utils/writeEnvFiles";
import { checkIfFolderExists } from "@/utils/checkIfFolderExists";

export interface InfisicalActionInputs {
  // INFISICAL_CLIENT_ID =
  infisicalClientId: string;
  // INFISICAL_CLIENT_SECRET =
  infisicalClientSecret: string;
  // INFISICAL_PROJECT_SLUG =
  infisicalProjectSlug: string;
  // INFISICAL_DOMAIN =
  infisicalDomain: string;
  // INFISICAL_ENV_SLUG =
  infisicalEnvSlug: string;
  // INFISICAL_PROJECT_ID =
  infisicalProjectId: string;

  folderAppend?: string;
  createFoldersFlag?: boolean;
}

export async function main(inputs: InfisicalActionInputs) {
  const startTime = Date.now();

  // Default values
  const folderAppend = inputs.folderAppend || "";
  const createFoldersFlag = inputs.createFoldersFlag || true;

  // Initialize Infisical client and authenticate
  const client = new InfisicalSDK({
    siteUrl: inputs.infisicalDomain,
  });

  await client.auth().universalAuth.login({
    clientId: inputs.infisicalClientId,
    clientSecret: inputs.infisicalClientSecret,
  });

  // Fetch all secrets recursively from the specified project and environment
  const config = {
    environment: inputs.infisicalEnvSlug,
    projectId: inputs.infisicalProjectId,
  };

  const allSecrets = await client
    .secrets()
    .listSecrets({ ...config, recursive: true });

  // Group secrets by their folder path for efficient processing
  // Uses Map for O(1) lookups and Set to track unique paths
  const secretsByPath = new Map<
    string,
    Array<{ key: string; value: string }>
  >();
  // Track unique folder paths for efficient directory creation
  const folderPaths = new Set<string>();

  for (const secret of allSecrets.secrets) {
    const path = secret.secretPath || "/";
    folderPaths.add(path);

    if (!secretsByPath.has(path)) {
      secretsByPath.set(path, []);
    }

    secretsByPath.get(path)!.push({
      key: secret.secretKey,
      value: secret.secretValue || "",
    });
  }

  const folderPathsArray = Array.from(folderPaths);

  // Build full folder paths, handling empty folderAppend and root path cases
  const folderPathsWithAppend = folderPathsArray
    .map((path) => {
      if (folderAppend === "") {
        // When folderAppend is empty, use secret paths directly
        // Root path is skipped (writes to current dir), others become relative paths
        return path === "/" ? null : path.slice(1); // Remove leading slash for relative paths
      }
      // When folderAppend is provided, prepend it and handle root path
      return path === "/" ? folderAppend : folderAppend + path;
    })
    .filter((path): path is string => path !== null); // Remove null entries (root path when folderAppend is empty)

  // Create directories only if createFoldersFlag is enabled
  // Skip root path when folderAppend is empty (writes directly to current directory)
  if (createFoldersFlag) {
    await createFolders(folderPathsWithAppend);
  }

  // Write .env files only to existing folders, with warnings for missing folders
  await writeEnvFiles(secretsByPath, folderAppend);

  const endTime = Date.now();
  const duration = endTime - startTime;
  console.log(`Action Run Completed in ${duration}ms`);
}
