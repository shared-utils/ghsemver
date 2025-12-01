# ghsemver

Semantic versioning tool based on GitHub commit history and Conventional Commits.

## Features

- 🚀 Calculate semantic versions from commit history
- 🔄 Follows Conventional Commits specification
- 🌿 Supports multi-branch workflows with prerelease versions
- 💡 Smart data source: local git first, GitHub API fallback
- 🎯 Zero configuration required
- 📦 Works in CI/CD environments (shallow clones supported)

## Installation

### Global Installation

```bash
npm install -g ghsemver
```

### Use with npx (Recommended)

```bash
npx ghsemver current
npx ghsemver next
```

## Usage

### Get Current Version

Get the latest semantic version tag from your repository:

```bash
ghsemver current
# Output: 1.0.0
```

### Calculate Next Version

Calculate the next version based on commit history:

```bash
ghsemver next
# Output: 1.1.0
```

### With Verbose Logging

Use `--log` flag to see detailed information:

```bash
ghsemver next --log
# Output:
# Current branch: main
# Main branch: main
# Current version: 1.0.0 (local git)
# Tag commit: abc1234 (local git)
# Analyzing 3 commit(s) (local git)
# Release type: minor
# 1.1.0
```

### Command Options

#### `current` command

Get the current version (latest semantic version tag).

```bash
ghsemver current [options]
```

Options:
- `-b, --branch <branch>` - Specify branch (optional)
- `-m, --main-branch <mainBranch>` - Specify main branch (optional)
- `--log` - Enable verbose logging

#### `next` command

Calculate the next version based on commits.

```bash
ghsemver next [options]
```

Options:
- `-b, --branch <branch>` - Specify branch (optional)
- `-m, --main-branch <mainBranch>` - Specify main branch (optional)
- `-s, --suffix <suffix>` - Prerelease suffix for non-main branches (optional)
- `--log` - Enable verbose logging

## Version Calculation Rules

This tool follows [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Major Version (X.0.0)

Incremented when commits contain breaking changes:
- `BREAKING CHANGE:` or `BREAKING-CHANGE:` in commit message body
- `!` after commit type: `feat!:`, `fix!:`

```
feat!: redesign authentication system

BREAKING CHANGE: removed old authentication API
```

Result: `1.0.0` → `2.0.0`

### Minor Version (0.X.0)

Incremented for new features:
- Commit type: `feat` or `feature`

```
feat: add user export functionality
```

Result: `1.0.0` → `1.1.0`

### Patch Version (0.0.X)

Incremented for bug fixes and performance improvements:
- Commit type: `fix`
- Commit type: `perf`

```
fix: resolve login page styling issue
perf: optimize database queries
```

Result: `1.0.0` → `1.0.1`

### Prerelease Versions

On non-main branches, versions include a prerelease identifier:

Format: `{version}-{suffix}.{number}`

```bash
# On develop branch
ghsemver next
# Output: 1.1.0-develop.1

# On feature/awesome branch
ghsemver next
# Output: 1.1.0-feature-awesome.1

# Custom suffix
ghsemver next --suffix beta
# Output: 1.1.0-beta.1
```

### No Version Bump

When commits don't match Conventional Commits patterns or only contain non-versioning types:
- `chore:`, `docs:`, `style:`, `refactor:`, `test:`, `build:`, `ci:`

```bash
ghsemver next
# Output: (empty string)
```

## Environment Variables

Set `GITHUB_TOKEN` to increase API rate limits:

```bash
export GITHUB_TOKEN=your_github_token_here
```

Get a token at: https://github.com/settings/tokens

## How It Works

1. **Repository Detection**: Extracts GitHub repository info from git remote
2. **Branch Detection**: Automatically detects current branch (or uses specified branch)
3. **Version Discovery**: Finds latest semantic version tag (vX.Y.Z format)
4. **Commit Analysis**: Gets commits since last tag, analyzes using Conventional Commits
5. **Version Calculation**: Calculates next version based on commit types

### Smart Data Source

The tool prioritizes local git operations and falls back to GitHub API when needed:

| Operation | Priority |
|-----------|----------|
| Current branch | Local git → CLI option → GitHub API |
| Latest tag | Local git → GitHub API |
| Commit history | Local git (if complete) → GitHub API |
| Main branch | CLI option → GitHub API |

This approach is:
- ⚡ **Fast**: Local operations are ~20x faster
- 🔒 **Offline-capable**: Works without internet if data is local
- 💰 **API-friendly**: Reduces GitHub API usage

## Examples

### Basic Usage

```bash
# Get current version
ghsemver current
# Output: 1.0.0

# Calculate next version (silent mode)
ghsemver next
# Output: 1.1.0
```

### In CI/CD

```yaml
# .github/workflows/release.yml
- name: Calculate version
  id: version
  run: |
    VERSION=$(npx ghsemver next)
    if [ -z "$VERSION" ]; then
      echo "No version bump needed"
      exit 0
    fi
    echo "version=$VERSION" >> $GITHUB_OUTPUT
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

- name: Create release
  if: steps.version.outputs.version
  run: |
    git tag "v${{ steps.version.outputs.version }}"
    git push origin "v${{ steps.version.outputs.version }}"
```

### In Package Scripts

```json
{
  "scripts": {
    "version:current": "ghsemver current",
    "version:next": "ghsemver next",
    "version:check": "ghsemver next || echo 'No version bump needed'"
  }
}
```

### Version Bump Script

```bash
#!/bin/bash
VERSION=$(ghsemver next)

if [ -z "$VERSION" ]; then
  echo "No version bump required"
  exit 0
fi

echo "Bumping version to $VERSION"
npm version $VERSION --no-git-tag-version
git add package.json
git commit -m "chore: bump version to $VERSION"
git tag "v$VERSION"
git push --follow-tags
```

## Tag Format

- ✅ Valid: `v1.0.0`, `v2.3.4`, `v10.20.30`
- ❌ Invalid: `1.0.0`, `v1.0`, `release-v1.0.0`

The tool only recognizes tags starting with `v` followed by semantic version (X.Y.Z).

Output versions do not include the `v` prefix.

## Requirements

- Node.js >= 18.0.0
- Git repository with GitHub remote
- Git installed and available in PATH

## License

ISC

## Contributing

Issues and pull requests are welcome at https://github.com/shared-utils/semver

## Credits

Inspired by [semantic-release](https://github.com/semantic-release/semantic-release) but designed to be:
- Lighter weight
- Zero configuration
- Focused on version calculation only
