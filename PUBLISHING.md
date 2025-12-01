# Publishing Setup Guide

This guide explains how to set up automated publishing for ghsemver using semantic-release.

## Prerequisites

1. **npm Account**: Create an account at https://www.npmjs.com/
2. **GitHub Repository**: Push code to https://github.com/shared-utils/semver
3. **Access Tokens**: Create required tokens

## Step 1: Create npm Access Token

1. Go to https://www.npmjs.com/settings/[your-username]/tokens
2. Click "Generate New Token" → "Classic Token"
3. Select "Automation" type
4. Copy the generated token (starts with `npm_`)

## Step 2: Add npm Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click "Add secret"

## Step 3: Verify GitHub Workflows

The repository includes two workflows:

### CI Workflow (`.github/workflows/ci.yml`)
- Runs on every push and PR
- Tests build on Node.js 18 and 20
- Ensures code compiles successfully

### Release Workflow (`.github/workflows/release.yml`)
- Runs on push to `main` branch
- Uses semantic-release to analyze commits
- Automatically creates releases and publishes to npm

## Step 4: How Release Process Works

### 1. Make Changes

Commit using Conventional Commits format:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update README"
```

### 2. Push to Main

```bash
git push origin main
```

### 3. semantic-release Automatically

When you push to main, semantic-release will:
- Analyze commits since last release
- Determine version bump based on commit types
- Update CHANGELOG.md
- Bump version in package.json
- Create a GitHub release with notes
- Publish package to npm
- Commit version changes back to main

All happens automatically in one workflow run!

## Step 5: First Release

For the first release:

1. Make sure your changes are committed:
```bash
git add .
git commit -m "feat: initial release"
```

2. Push to main:
```bash
git push origin main
```

3. Check GitHub Actions to watch the release process

4. Verify on npm:
```bash
npm view ghsemver
```

## Versioning Rules

Based on Conventional Commits:

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `fix:` | Patch (0.0.X) | 1.0.0 → 1.0.1 |
| `feat:` | Minor (0.X.0) | 1.0.0 → 1.1.0 |
| `BREAKING CHANGE:` or `!:` | Major (X.0.0) | 1.0.0 → 2.0.0 |
| `chore:`, `docs:`, etc. | No release | - |

## Configuration

semantic-release is configured in `.releaserc.json`:

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

This configuration:
- Analyzes commits for version bump
- Generates release notes
- Updates CHANGELOG.md
- Publishes to npm
- Commits changes back to repo
- Creates GitHub release

## Troubleshooting

### No Release Created

Check that:
- Commits follow Conventional Commits format
- Commits include types that trigger releases (`feat`, `fix`, etc.)
- GitHub Actions have proper permissions
- There are new commits since last release

### npm Publish Fails

Check that:
- `NPM_TOKEN` secret is set correctly
- Token has "Automation" permissions
- Package name `@sharedutils/semver` is available or you own it

### Build Fails in CI

Check that:
- Code compiles locally: `npm run build`
- All dependencies are listed in package.json
- Node version is >= 18

## Manual Release (Emergency Only)

If you need to release manually:

```bash
# Build the project
npm run build

# Login to npm
npm login

# Publish
npm publish --access public

# Create git tag
git tag v1.0.0
git push origin v1.0.0
```

## Package Scope

The package is published under the `@sharedutils` scope. To publish under a different scope:

1. Update `name` in package.json:
```json
{
  "name": "your-package-name"
}
```

## Skipping Release

To commit without triggering a release, add `[skip ci]` to commit message:

```bash
git commit -m "docs: update README [skip ci]"
```

## Support

For issues or questions:
- Open an issue: https://github.com/shared-utils/semver/issues
- Check documentation: https://github.com/shared-utils/semver

