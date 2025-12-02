#!/usr/bin/env node

import { getCurrentVersion, getNextVersion } from './index.js';
import * as core from '@actions/core';

async function run() {
  try {
    // Get inputs
    const command = core.getInput('command', { required: true });
    const branch = core.getInput('branch');
    const mainBranch = core.getInput('main-branch');
    const suffix = core.getInput('suffix');
    const log = core.getInput('log') === 'true';

    // Build options
    const options = {
      branch: branch || undefined,
      mainBranch: mainBranch || undefined,
      suffix: suffix || undefined,
      log,
    };

    // Run command
    let version = '';
    if (command === 'current') {
      version = await getCurrentVersion(options);
    } else if (command === 'next') {
      version = await getNextVersion(options);
    } else {
      core.setFailed(`Invalid command: ${command}. Must be 'current' or 'next'.`);
      return;
    }

    // Set output
    core.setOutput('version', version);

    // Also log to console
    if (log || version) {
      console.log(`Version: ${version}`);
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();

