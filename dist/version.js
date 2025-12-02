import semver from 'semver';
import { ReleaseType } from './types.js';
/**
 * Parse Conventional Commits message and return release type
 */
function parseCommitType(message) {
    const lines = message.split('\n');
    const firstLine = lines[0];
    // Check for BREAKING CHANGE
    const hasBreakingChange = firstLine.includes('!:') ||
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
export function analyzeCommits(commits) {
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
export function calculateNextVersion(currentVersion, releaseType, isMainBranch, suffix) {
    // No version bump needed
    if (releaseType === ReleaseType.NONE) {
        return null;
    }
    // Start from 0.0.0 if no current version
    const baseVersion = currentVersion || '0.0.0';
    // Calculate new version (always from stable base version)
    let nextVersion = null;
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
    }
    else {
        // Non-main branch: prerelease version
        const prereleaseId = suffix || 'dev';
        // Calculate what the next stable version would be
        let nextStableVersion = null;
        switch (releaseType) {
            case ReleaseType.MAJOR:
                nextStableVersion = semver.inc(baseVersion, 'major');
                break;
            case ReleaseType.MINOR:
                nextStableVersion = semver.inc(baseVersion, 'minor');
                break;
            case ReleaseType.PATCH:
                nextStableVersion = semver.inc(baseVersion, 'patch');
                break;
        }
        if (!nextStableVersion) {
            return null;
        }
        // Format: nextStableVersion-suffix.1
        nextVersion = `${nextStableVersion}-${prereleaseId}.1`;
    }
    return nextVersion;
}
/**
 * Normalize version string (remove 'v' prefix)
 */
export function normalizeVersion(version) {
    return version.startsWith('v') ? version.substring(1) : version;
}
//# sourceMappingURL=version.js.map