# Using ghsemver as a GitHub Action

## Overview

The `ghsemver` action calculates semantic versions based on your GitHub commit history and Conventional Commits, making it easy to automate versioning in your CI/CD workflows.

## Quick Start

### Get Next Version

```yaml
- uses: shared-utils/ghsemver@v1
  id: version
  with:
    command: next

- name: Use version
  run: echo "Next version is ${{ steps.version.outputs.version }}"
```

### Get Current Version

```yaml
- uses: shared-utils/ghsemver@v1
  id: version
  with:
    command: current

- name: Use version
  run: echo "Current version is ${{ steps.version.outputs.version }}"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `command` | Command to run: `current` or `next` | Yes | `next` |
| `branch` | Branch name (auto-detected if not provided) | No | - |
| `main-branch` | Main branch name (auto-detected if not provided) | No | - |
| `suffix` | Prerelease suffix for non-main branches | No | Branch name |
| `log` | Enable verbose logging | No | `false` |

## Outputs

| Output | Description |
|--------|-------------|
| `version` | The calculated version number (without `v` prefix) |

## Examples

### Basic Usage

```yaml
name: Version Check

on: [push, pull_request]

jobs:
  version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for full git history

      - uses: shared-utils/ghsemver@v1
        id: version
        with:
          command: next

      - run: echo "Next version: ${{ steps.version.outputs.version }}"
```

### Custom Branch and Suffix

```yaml
- uses: shared-utils/ghsemver@v1
  id: version
  with:
    command: next
    branch: feature/my-feature
    main-branch: main
    suffix: beta
    log: true
```

### Conditional Release

```yaml
- uses: shared-utils/ghsemver@v1
  id: version
  with:
    command: next

- name: Create Release
  if: steps.version.outputs.version != ''
  run: |
    echo "Creating release for v${{ steps.version.outputs.version }}"
    # Your release commands here
```

### Multi-Branch Strategy

```yaml
name: Version by Branch

on:
  push:
    branches: [main, develop, 'feature/**']

jobs:
  version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: shared-utils/ghsemver@v1
        id: version
        with:
          command: next
          suffix: ${{ github.ref_name == 'develop' && 'beta' || 'alpha' }}

      - name: Show version
        run: echo "Version for ${{ github.ref_name }}: ${{ steps.version.outputs.version }}"
```

### Build with Version

```yaml
name: Build and Tag

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: shared-utils/ghsemver@v1
        id: version
        with:
          command: next

      - name: Build with version
        if: steps.version.outputs.version != ''
        run: |
          VERSION=${{ steps.version.outputs.version }}
          echo "Building version $VERSION"
          # Build your project with version number
          npm version $VERSION --no-git-tag-version
          npm run build

      - name: Create Git Tag
        if: steps.version.outputs.version != ''
        run: |
          VERSION=${{ steps.version.outputs.version }}
          git config user.name github-actions
          git config user.email github-actions@github.com
          git tag -a "v$VERSION" -m "Release v$VERSION"
          git push origin "v$VERSION"
```

### Docker Image Tagging

```yaml
- uses: shared-utils/ghsemver@v1
  id: version
  with:
    command: next

- name: Build Docker Image
  if: steps.version.outputs.version != ''
  run: |
    VERSION=${{ steps.version.outputs.version }}
    docker build -t myapp:$VERSION .
    docker tag myapp:$VERSION myapp:latest
```

### NPM Publish with Auto Version

```yaml
name: Publish to NPM

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - uses: shared-utils/ghsemver@v1
        id: version
        with:
          command: next

      - name: Publish
        if: steps.version.outputs.version != ''
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: |
          VERSION=${{ steps.version.outputs.version }}
          npm version $VERSION --no-git-tag-version
          npm publish
```

## Important Notes

1. **Git History**: Always use `fetch-depth: 0` in `actions/checkout` to get full git history:
   ```yaml
   - uses: actions/checkout@v4
     with:
       fetch-depth: 0
   ```

2. **Empty Output**: If no new version is needed (no qualifying commits), the `version` output will be empty. Check for this before proceeding:
   ```yaml
   - if: steps.version.outputs.version != ''
     run: echo "Has new version"
   ```

3. **Permissions**: The action uses `github.token` automatically for GitHub API access. No additional setup needed.

4. **Conventional Commits**: Ensure your commit messages follow the Conventional Commits format:
   - `feat:` - Minor version bump
   - `fix:` - Patch version bump
   - `BREAKING CHANGE:` or `feat!:` / `fix!:` - Major version bump

## Troubleshooting

### No version output

- Ensure you have qualifying commits (`feat:`, `fix:`, etc.)
- Check that git tags are properly formatted (`vX.Y.Z`)
- Enable logging with `log: true` to debug

### Version not matching expectations

- Verify your commit messages follow Conventional Commits
- Check which branch you're on (main vs feature branches)
- Enable logging to see how the version is calculated

### Permission errors

- Ensure `fetch-depth: 0` is set in checkout step
- Verify the repository has proper git history

## See Also

- [CLI Documentation](./README.md)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

