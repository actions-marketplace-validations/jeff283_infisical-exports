import * as core from "@actions/core";
import { main, type InfisicalActionInputs } from "@/action";

async function run() {
  try {
    // Inputs
    // const infisicalClientId = core.getInput("infisical-client-id");
    // const infisicalClientSecret = core.getInput("infisical-client-secret");
    // const infisicalProjectSlug = core.getInput("infisical-project-slug");
    // const infisicalDomain = core.getInput("infisical-domain");
    // const infisicalEnvSlug = core.getInput("infisical-env-slug");

    const inputs: InfisicalActionInputs = {
      infisicalClientId: process.env.INFISICAL_CLIENT_ID || "",
      infisicalClientSecret: process.env.INFISICAL_CLIENT_SECRET || "",
      infisicalProjectSlug: process.env.INFISICAL_PROJECT_SLUG || "",
      infisicalProjectId: process.env.INFISICAL_PROJECT_ID || "",
      infisicalDomain: process.env.INFISICAL_DOMAIN || "",
      infisicalEnvSlug: process.env.INFISICAL_ENV_SLUG || "",
    };
    await main(inputs);
  } catch (error) {
    const e = error as Error;
    core.setFailed(e.message);
  }
}

run();
