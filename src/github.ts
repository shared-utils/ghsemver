import { Octokit } from '@octokit/rest';
import { CommitInfo, RepoInfo } from './types.js';

export class GitHubClient {
  private octokit: Octokit;
  private repoInfo: RepoInfo;

  constructor(repoInfo: RepoInfo, token?: string) {
    this.repoInfo = repoInfo;
    this.octokit = new Octokit({
      auth: token || process.env.GITHUB_TOKEN,
    });
  }

  /**
   * Get default branch
   */
  async getDefaultBranch(): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.get({
        owner: this.repoInfo.owner,
        repo: this.repoInfo.repo,
      });
      return data.default_branch;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get branch name by SHA
   */
  async getBranchBySha(sha: string): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.listBranchesForHeadCommit({
        owner: this.repoInfo.owner,
        repo: this.repoInfo.repo,
        commit_sha: sha,
      });

      if (data.length === 0) {
        return null;
      }

      return data[0].name;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get latest semantic version tag (vX.Y.Z format)
   * @param branch Optional branch to search tags from
   * @param stableOnly If true, only return stable versions (no prerelease)
   */
  async getLatestTag(branch?: string, stableOnly: boolean = false): Promise<string | null> {
    try {
      // If branch specified, get tags reachable from that branch
      if (branch) {
        const commits = await this.octokit.repos.listCommits({
          owner: this.repoInfo.owner,
          repo: this.repoInfo.repo,
          sha: branch,
          per_page: 100,
        });
        
        const commitShas = new Set(commits.data.map(c => c.sha));
        
        // Get all tags
        const { data: tags } = await this.octokit.repos.listTags({
          owner: this.repoInfo.owner,
          repo: this.repoInfo.repo,
          per_page: 100,
        });
        
        // Find first semantic version tag that exists in the branch
        for (const tag of tags) {
          const matchesFormat = stableOnly 
            ? /^v\d+\.\d+\.\d+$/.test(tag.name)  // Exact vX.Y.Z
            : /^v\d+\.\d+\.\d+/.test(tag.name);  // vX.Y.Z or vX.Y.Z-anything
          
          if (matchesFormat && commitShas.has(tag.commit.sha)) {
            return tag.name;
          }
        }
        
        return null;
      }

      // No branch specified, get latest tag globally
      const { data } = await this.octokit.repos.listTags({
        owner: this.repoInfo.owner,
        repo: this.repoInfo.repo,
        per_page: 100,
      });

      if (data.length === 0) {
        return null;
      }

      // Find first tag matching vX.Y.Z format
      for (const tag of data) {
        const matchesFormat = stableOnly 
          ? /^v\d+\.\d+\.\d+$/.test(tag.name)  // Exact vX.Y.Z
          : /^v\d+\.\d+\.\d+/.test(tag.name);  // vX.Y.Z or vX.Y.Z-anything
        
        if (matchesFormat) {
          return tag.name;
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
  async getTagCommitSha(tag: string): Promise<string | null> {
    try {
      const { data } = await this.octokit.git.getRef({
        owner: this.repoInfo.owner,
        repo: this.repoInfo.repo,
        ref: `tags/${tag}`,
      });

      return data.object.sha;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get commits between two commits
   */
  async getCommitsBetween(
    base: string | null,
    head: string,
  ): Promise<CommitInfo[]> {
    try {
      let commits: CommitInfo[] = [];

      if (!base) {
        const { data } = await this.octokit.repos.listCommits({
          owner: this.repoInfo.owner,
          repo: this.repoInfo.repo,
          sha: head,
          per_page: 100,
        });

        commits = data.map((commit) => ({
          sha: commit.sha,
          message: commit.commit.message,
          date: commit.commit.author?.date || '',
        }));
      } else {
        const { data } = await this.octokit.repos.compareCommits({
          owner: this.repoInfo.owner,
          repo: this.repoInfo.repo,
          base,
          head,
        });

        commits = data.commits.map((commit) => ({
          sha: commit.sha,
          message: commit.commit.message,
          date: commit.commit.author?.date || '',
        }));
      }

      return commits;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get branch HEAD SHA
   */
  async getBranchHeadSha(branch: string): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.getBranch({
        owner: this.repoInfo.owner,
        repo: this.repoInfo.repo,
        branch,
      });

      return data.commit.sha;
    } catch (error) {
      return null;
    }
  }
}

