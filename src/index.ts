import * as core from "@actions/core";
import { main, type InfisicalActionInputs } from "@/action";

async function run() {
  try {
    // Get inputs from GitHub Actions
    const infisicalClientId = core.getInput("infisical-client-id", {
      required: true,
    });
    const infisicalClientSecret = core.getInput("infisical-client-secret", {
      required: true,
    });
    const infisicalProjectId = core.getInput("infisical-project-id", {
      required: true,
    });
    const infisicalDomain =
      core.getInput("infisical-domain") || "https://eu.infisical.com";
    const infisicalEnvSlug = core.getInput("infisical-env-slug") || "dev";
    const folderAppend = core.getInput("folder-append") || "";
    const createFoldersFlag =
      core.getBooleanInput("create-folders-flag") || false;

    const inputs: InfisicalActionInputs = {
      infisicalClientId,
      infisicalClientSecret,
      infisicalProjectId,
      infisicalDomain,
      infisicalEnvSlug,
      folderAppend: folderAppend || undefined,
      createFoldersFlag: createFoldersFlag || undefined,
    };
    await main(inputs);
  } catch (error) {
    const e = error as Error;
    core.setFailed(e.message);
  }
}

run();
