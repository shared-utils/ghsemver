import { CommitInfo } from './types.js';
/**
 * Get current Git SHA
 */
export declare function getCurrentSha(): string | null;
/**
 * Get current branch name
 */
export declare function getCurrentBranch(): string | null;
/**
 * Parse repository info from remote URL
 */
export declare function getRepoInfoFromRemote(): {
    owner: string;
    repo: string;
} | null;
/**
 * Get latest semantic version tag from local git (vX.Y.Z format)
 * @param branch Optional branch to search tags from
 * @param stableOnly If true, only return stable versions (no prerelease)
 */
export declare function getLatestTag(branch?: string, stableOnly?: boolean): string | null;
/**
 * Get commit SHA for a specific tag
 */
export declare function getTagCommitSha(tag: string): string | null;
/**
 * Get commits between two refs (or all commits if base is null)
 */
export declare function getLocalCommits(base: string | null, head: string): CommitInfo[];
/**
 * Check if a commit exists locally
 */
export declare function commitExists(sha: string): boolean;
//# sourceMappingURL=git.d.ts.map