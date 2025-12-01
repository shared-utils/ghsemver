import { GitHubClient } from './github.js';
import {
  getCurrentSha,
  getRepoInfoFromRemote,
  getCurrentBranch,
  getLatestTag as getLocalLatestTag,
  getTagCommitSha as getLocalTagCommitSha,
  getLocalCommits,
  commitExists,
} from './git.js';
import { analyzeCommits, calculateNextVersion, normalizeVersion } from './version.js';
import { CliOptions } from './types.js';

/**
 * Get current version
 */
export async function getCurrentVersion(options: CliOptions = {}): Promise<string> {
  const log = options.log ? console.error : () => {};

  // Get repository info
  const repoInfo = getRepoInfoFromRemote();
  if (!repoInfo) {
    return '';
  }

  const githubClient = new GitHubClient(repoInfo);

  // Determine current branch (prefer local)
  let currentBranch = options.branch || getCurrentBranch();
  
  if (!currentBranch) {
    const currentSha = getCurrentSha();
    if (currentSha) {
      currentBranch = await githubClient.getBranchBySha(currentSha);
    }
  }

  if (!currentBranch) {
    return '';
  }

  // Determine main branch
  let mainBranch = options.mainBranch;
  if (!mainBranch) {
    const defaultBranch = await githubClient.getDefaultBranch();
    if (!defaultBranch) {
      return '';
    }
    mainBranch = defaultBranch;
  }

  const isMainBranch = currentBranch === mainBranch;

  // For main branch, only return stable versions (no prerelease)
  // For other branches, return any version
  let latestTag = getLocalLatestTag(currentBranch, isMainBranch);
  let source = 'local git';
  
  if (!latestTag) {
    latestTag = await githubClient.getLatestTag(currentBranch, isMainBranch);
    source = 'GitHub API';
  }

  const currentVersion = latestTag ? normalizeVersion(latestTag) : '';
  log(`${currentVersion}`);
  log(`Source: ${source}`);
  
  return currentVersion;
}

/**
 * Calculate next version
 */
export async function getNextVersion(options: CliOptions = {}): Promise<string> {
  const log = options.log ? console.error : () => {};

  // Get repository info
  const repoInfo = getRepoInfoFromRemote();
  if (!repoInfo) {
    return '';
  }

  const githubClient = new GitHubClient(repoInfo);

  // 1. Determine current branch (prefer local)
  let currentBranch = options.branch || getCurrentBranch();
  
  if (!currentBranch) {
    // Fallback to GitHub API
    const currentSha = getCurrentSha();
    if (currentSha) {
      currentBranch = await githubClient.getBranchBySha(currentSha);
    }
  }

  if (!currentBranch) {
    return '';
  }

  log(`Current branch: ${currentBranch}`);

  // 2. Determine main branch
  let mainBranch = options.mainBranch;
  if (!mainBranch) {
    const defaultBranch = await githubClient.getDefaultBranch();
    if (!defaultBranch) {
      return '';
    }
    mainBranch = defaultBranch;
  }

  log(`Main branch: ${mainBranch}`);

  const isMainBranch = currentBranch === mainBranch;

  // 3. Get current version (prefer local)
  // Always get the latest tag from current branch first
  // For main branch, only consider stable versions (no prerelease)
  let latestTag = getLocalLatestTag(currentBranch, isMainBranch);
  let source = 'local git';
  
  if (!latestTag) {
    latestTag = await githubClient.getLatestTag(currentBranch, isMainBranch);
    source = 'GitHub API';
  }

  // For non-main branches, if no tag found on current branch, fallback to main branch
  if (!latestTag && !isMainBranch) {
    latestTag = getLocalLatestTag(mainBranch, true); // Only stable versions from main
    if (!latestTag) {
      latestTag = await githubClient.getLatestTag(mainBranch, true);
      source = 'GitHub API';
    }
    source = source + ', from main';
  }

  const currentVersion = latestTag ? normalizeVersion(latestTag) : null;
  log(`Current version: ${currentVersion || 'none'} (${source})`);


  // 4. Get commit history (prefer local when complete)
  let baseCommitSha: string | null = null;
  let tagSource = 'none';
  
  if (latestTag) {
    // Try to get tag commit SHA
    baseCommitSha = getLocalTagCommitSha(latestTag);
    if (baseCommitSha) {
      tagSource = 'local git';
    } else {
      baseCommitSha = await githubClient.getTagCommitSha(latestTag);
      tagSource = baseCommitSha ? 'GitHub API' : 'not found';
    }
    
    if (baseCommitSha) {
      log(`Tag commit: ${baseCommitSha.substring(0, 7)} (${tagSource})`);
    }
  }

  let headCommitSha = getCurrentSha();
  if (!headCommitSha) {
    headCommitSha = await githubClient.getBranchHeadSha(currentBranch);
  }

  if (!headCommitSha) {
    return '';
  }

  // Determine if we can use local commits
  let commits = [];
  let commitSource = 'GitHub API'; // Default to API
  
  // Can use local commits only if:
  // 1. No base commit (get all local commits), OR
  // 2. Base commit exists locally (complete history)
  const canUseLocal = !baseCommitSha || commitExists(baseCommitSha);
  
  if (canUseLocal) {
    commits = getLocalCommits(baseCommitSha, headCommitSha);
    
    // Verify we got commits (if we expected some)
    if (baseCommitSha) {
      // If base and head are the same, no new commits
      if (baseCommitSha === headCommitSha) {
        commitSource = 'local git';
      } else if (commits.length > 0) {
        commitSource = 'local git';
      } else {
        // Local returned 0 commits but we expected some
        // Fallback to API
        log('Local git returned 0 commits, fetching from GitHub API');
        commits = await githubClient.getCommitsBetween(baseCommitSha, headCommitSha);
        commitSource = 'GitHub API';
      }
    } else {
      // No base commit, all local commits are valid
      commitSource = 'local git';
    }
  } else {
    // Base commit not found locally, must use API
    log('Base commit not found locally, fetching from GitHub API');
    commits = await githubClient.getCommitsBetween(baseCommitSha, headCommitSha);
  }

  log(`Analyzing ${commits.length} commit(s) (${commitSource})`);

  // 5. Analyze commits and determine release type
  const releaseType = analyzeCommits(commits);
  log(`Release type: ${releaseType}`);

  // 6. Calculate next version
  const suffix = !isMainBranch ? options.suffix || currentBranch : undefined;
  const nextVersion = calculateNextVersion(
    currentVersion,
    releaseType,
    isMainBranch,
    suffix,
  );

  if (!nextVersion) {
    return '';
  }

  return nextVersion;
}

