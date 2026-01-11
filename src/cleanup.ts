import * as core from "@actions/core";

async function postCleanup() {
  try {
  } catch (error) {
    const e = error as Error;
    core.setFailed(e.message);
  }
}

postCleanup();
