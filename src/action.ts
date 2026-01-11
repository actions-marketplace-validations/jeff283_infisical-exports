import { InfisicalSDK } from "@infisical/sdk";
import { stat } from "node:fs/promises";
import { mkdir } from "node:fs/promises";

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
}

export async function main(inputs: InfisicalActionInputs) {
  const folderAppend = inputs.folderAppend || "mock-folder";
  const startTime = Date.now();
  // Create a new Infisical client
  const client = new InfisicalSDK({
    siteUrl: inputs.infisicalDomain,
  });

  //   Authenticate the client
  await client.auth().universalAuth.login({
    clientId: inputs.infisicalClientId,
    clientSecret: inputs.infisicalClientSecret,
  });

  const config = {
    environment: inputs.infisicalEnvSlug, // stg, dev, prod, or custom environment slugs
    projectId: inputs.infisicalProjectId,
  };

  const allSecrets = await client
    .secrets()
    .listSecrets({ ...config, recursive: true });

  // Extract unique folder paths efficiently - O(n) time, O(k) space where k = unique paths
  const folderPaths = new Set<string>();
  for (const secret of allSecrets.secrets) {
    if (secret.secretPath) {
      folderPaths.add(secret.secretPath);
    }
  }
  const folderPathsArray = Array.from(folderPaths);
  const folderPathsWithAppend = folderPathsArray.map(
    (path) => folderAppend + path
  );
  console.log("Folder Paths Count:", folderPathsWithAppend.length);
  console.log("Folder Paths:", folderPathsWithAppend);

  await createFolders(folderPathsWithAppend);

  const endTime = Date.now();
  const duration = endTime - startTime;
  console.log(`Action Run Completed in ${duration}ms`);
}

// Check if the folder exists
async function checkIfFolderExists(folderPath: string) {
  return await stat(folderPath)
    .then(() => true)
    .catch(() => false);
}

async function createFolders(folderPaths: string[]) {
  for (const folderPath of folderPaths) {
    if (await checkIfFolderExists(folderPath)) {
      console.log(`Folder ${folderPath} already exists`);
    } else {
      await mkdir(folderPath, { recursive: true }).catch((error) => {
        console.error(`Error creating folder ${folderPath}: ${error}`);
      });
      console.log(`Folder ${folderPath} created`);
    }
  }
}
