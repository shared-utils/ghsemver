import semver from 'semver';
import { CommitInfo, ReleaseType } from './types.js';

/**
 * Parse Conventional Commits message and return release type
 */
function parseCommitType(message: string): ReleaseType {
  const lines = message.split('\n');
  const firstLine = lines[0];

  // Check for BREAKING CHANGE
  const hasBreakingChange =
    firstLine.includes('!:') ||
    message.includes('BREAKING CHANGE:') ||
    message.includes('BREAKING-CHANGE:');

  if (hasBreakingChange) {
    return ReleaseType.MAJOR;
  }

  // Parse commit type
  const typeMatch = firstLine.match(/^(\w+)(\(.+?\))?!?:/);
  if (!typeMatch) {
    return ReleaseType.NONE;
  }

  const type = typeMatch[1].toLowerCase();

  // feat: new feature -> minor
  if (type === 'feat' || type === 'feature') {
    return ReleaseType.MINOR;
  }

  // fix: bug fix -> patch
  if (type === 'fix') {
    return ReleaseType.PATCH;
  }

  // perf: performance improvement -> patch
  if (type === 'perf') {
    return ReleaseType.PATCH;
  }

  // Other types don't trigger version bump
  return ReleaseType.NONE;
}

/**
 * Analyze commit history and determine release type
 */
export function analyzeCommits(commits: CommitInfo[]): ReleaseType {
  let releaseType = ReleaseType.NONE;

  for (const commit of commits) {
    const commitType = parseCommitType(commit.message);

    if (commitType === ReleaseType.MAJOR) {
      return ReleaseType.MAJOR; // MAJOR has highest priority
    }

    if (commitType === ReleaseType.MINOR) {
      releaseType = ReleaseType.MINOR;
    }

    if (commitType === ReleaseType.PATCH && releaseType === ReleaseType.NONE) {
      releaseType = ReleaseType.PATCH;
    }
  }

  return releaseType;
}

/**
 * Calculate next version number
 * Returns null if no version bump is needed
 */
export function calculateNextVersion(
  currentVersion: string | null,
  releaseType: ReleaseType,
  isMainBranch: boolean,
  suffix?: string,
): string | null {
  // No version bump needed
  if (releaseType === ReleaseType.NONE) {
    return null;
  }

  // Start from 0.0.0 if no current version
  let baseVersion = currentVersion || '0.0.0';

  // Remove prerelease tags
  const parsed = semver.parse(baseVersion);
  if (parsed && parsed.prerelease.length > 0) {
    baseVersion = `${parsed.major}.${parsed.minor}.${parsed.patch}`;
  }

  // Calculate new version
  let nextVersion: string | null = null;

  if (isMainBranch) {
    // Main branch: stable version
    switch (releaseType) {
      case ReleaseType.MAJOR:
        nextVersion = semver.inc(baseVersion, 'major');
        break;
      case ReleaseType.MINOR:
        nextVersion = semver.inc(baseVersion, 'minor');
        break;
      case ReleaseType.PATCH:
        nextVersion = semver.inc(baseVersion, 'patch');
        break;
    }
  } else {
    // Non-main branch: prerelease version
    const prereleaseId = suffix || 'dev';

    switch (releaseType) {
      case ReleaseType.MAJOR:
        nextVersion = semver.inc(baseVersion, 'premajor', prereleaseId);
        break;
      case ReleaseType.MINOR:
        nextVersion = semver.inc(baseVersion, 'preminor', prereleaseId);
        break;
      case ReleaseType.PATCH:
        nextVersion = semver.inc(baseVersion, 'prepatch', prereleaseId);
        break;
    }
    
    // Change prerelease number from 0 to 1
    if (nextVersion) {
      const parsed = semver.parse(nextVersion);
      if (parsed && parsed.prerelease.length > 0) {
        const lastPart = parsed.prerelease[parsed.prerelease.length - 1];
        if (lastPart === 0) {
          const newPrerelease = [...parsed.prerelease];
          newPrerelease[newPrerelease.length - 1] = 1;
          nextVersion = `${parsed.major}.${parsed.minor}.${parsed.patch}-${newPrerelease.join('.')}`;
        }
      }
    }
  }

  return nextVersion;
}

/**
 * Normalize version string (remove 'v' prefix)
 */
export function normalizeVersion(version: string): string {
  return version.startsWith('v') ? version.substring(1) : version;
}

