import { CommitInfo, RepoInfo } from './types.js';
export declare class GitHubClient {
    private octokit;
    private repoInfo;
    constructor(repoInfo: RepoInfo, token?: string);
    /**
     * Get default branch
     */
    getDefaultBranch(): Promise<string | null>;
    /**
     * Get branch name by SHA
     */
    getBranchBySha(sha: string): Promise<string | null>;
    /**
     * Get latest semantic version tag (vX.Y.Z format)
     * @param branch Optional branch to search tags from
     * @param stableOnly If true, only return stable versions (no prerelease)
     */
    getLatestTag(branch?: string, stableOnly?: boolean): Promise<string | null>;
    /**
     * Get commit SHA for a specific tag
     */
    getTagCommitSha(tag: string): Promise<string | null>;
    /**
     * Get commits between two commits
     */
    getCommitsBetween(base: string | null, head: string): Promise<CommitInfo[]>;
    /**
     * Get branch HEAD SHA
     */
    getBranchHeadSha(branch: string): Promise<string | null>;
}
//# sourceMappingURL=github.d.ts.map