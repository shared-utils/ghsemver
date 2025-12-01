#!/usr/bin/env node

import { Command } from 'commander';
import { getCurrentVersion, getNextVersion } from './index.js';

const program = new Command();

program
  .name('ghsemver')
  .description('Semantic versioning tool based on GitHub commit history')
  .version('1.0.0');

program
  .command('current')
  .description('Get current version')
  .option('-b, --branch <branch>', 'Specify branch')
  .option('-m, --main-branch <mainBranch>', 'Specify main branch')
  .option('--log', 'Enable verbose logging')
  .action(async (options) => {
    try {
      const version = await getCurrentVersion(options);
      console.log(version);
    } catch (error) {
      if (options.log) {
        console.error('Error:', error instanceof Error ? error.message : error);
      }
      process.exit(1);
    }
  });

program
  .command('next')
  .description('Calculate next version')
  .option('-b, --branch <branch>', 'Specify branch')
  .option('-m, --main-branch <mainBranch>', 'Specify main branch')
  .option('-s, --suffix <suffix>', 'Prerelease suffix (non-main branch)')
  .option('--log', 'Enable verbose logging')
  .action(async (options) => {
    try {
      const version = await getNextVersion(options);
      console.log(version);
    } catch (error) {
      if (options.log) {
        console.error('Error:', error instanceof Error ? error.message : error);
      }
      process.exit(1);
    }
  });

program.parse();
