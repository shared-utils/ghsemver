export interface CliOptions {
    branch?: string;
    mainBranch?: string;
    suffix?: string;
    log?: boolean;
}
export interface CommitInfo {
    sha: string;
    message: string;
    date: string;
}
export declare enum ReleaseType {
    MAJOR = "major",
    MINOR = "minor",
    PATCH = "patch",
    PRERELEASE = "prerelease",
    NONE = "none"
}
export interface VersionInfo {
    current: string;
    next: string;
    releaseType: ReleaseType;
}
export interface RepoInfo {
    owner: string;
    repo: string;
}
//# sourceMappingURL=types.d.ts.map