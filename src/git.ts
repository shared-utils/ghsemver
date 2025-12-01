import { execSync } from 'child_process';
import { CommitInfo } from './types.js';

/**
 * Get current Git SHA
 */
export function getCurrentSha(): string | null {
  try {
    const sha = execSync('git rev-parse HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    return sha;
  } catch (error) {
    return null;
  }
}

/**
 * Get current branch name
 */
export function getCurrentBranch(): string | null {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    return branch;
  } catch (error) {
    return null;
  }
}

/**
 * Parse repository info from remote URL
 */
export function getRepoInfoFromRemote(): { owner: string; repo: string } | null {
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    // Support SSH and HTTPS formats
    // SSH: git@github.com:owner/repo.git
    // HTTPS: https://github.com/owner/repo.git
    let match = remoteUrl.match(/github\.com[:/]([^/]+)\/(.+?)(\.git)?$/);
    
    if (!match) {
      return null;
    }

    return {
      owner: match[1],
      repo: match[2],
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get latest semantic version tag from local git (vX.Y.Z format)
 * @param branch Optional branch to search tags from
 * @param stableOnly If true, only return stable versions (no prerelease)
 */
export function getLatestTag(branch?: string, stableOnly: boolean = false): string | null {
  try {
    let command = 'git tag --sort=-version:refname';
    
    // If branch specified, only get tags reachable from that branch
    if (branch) {
      command = `git tag --sort=-version:refname --merged ${branch}`;
    }
    
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    
    if (!output) {
      return null;
    }
    
    const tags = output.split('\n');
    
    // Find first tag matching vX.Y.Z format
    for (const tag of tags) {
      if (stableOnly) {
        // Only match exact vX.Y.Z format (no prerelease suffix)
        if (/^v\d+\.\d+\.\d+$/.test(tag)) {
          return tag;
        }
      } else {
        // Match vX.Y.Z or vX.Y.Z-anything
        if (/^v\d+\.\d+\.\d+/.test(tag)) {
          return tag;
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get commit SHA for a specific tag
 */
export function getTagCommitSha(tag: string): string | null {
  try {
    const sha = execSync(`git rev-list -n 1 ${tag}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    return sha;
  } catch (error) {
    return null;
  }
}

/**
 * Get commits between two refs (or all commits if base is null)
 */
export function getLocalCommits(base: string | null, head: string): CommitInfo[] {
  try {
    let range = head;
    if (base) {
      range = `${base}..${head}`;
    }

    const output = execSync(`git log ${range} --format=%H%n%s%n%aI%n---END---`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    if (!output) {
      return [];
    }

    const commits: CommitInfo[] = [];
    const commitBlocks = output.split('---END---\n');

    for (const block of commitBlocks) {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        commits.push({
          sha: lines[0],
          message: lines.slice(1, -1).join('\n'),
          date: lines[lines.length - 1],
        });
      }
    }

    return commits;
  } catch (error) {
    return [];
  }
}

/**
 * Check if a commit exists locally
 */
export function commitExists(sha: string): boolean {
  try {
    execSync(`git cat-file -e ${sha}^{commit}`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return true;
  } catch (error) {
    return false;
  }
}

