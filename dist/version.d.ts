import { CommitInfo, ReleaseType } from './types.js';
/**
 * Analyze commit history and determine release type
 */
export declare function analyzeCommits(commits: CommitInfo[]): ReleaseType;
/**
 * Calculate next version number
 * Returns null if no version bump is needed
 */
export declare function calculateNextVersion(currentVersion: string | null, releaseType: ReleaseType, isMainBranch: boolean, suffix?: string): string | null;
/**
 * Normalize version string (remove 'v' prefix)
 */
export declare function normalizeVersion(version: string): string;
//# sourceMappingURL=version.d.ts.map