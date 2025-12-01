# Migration to semantic-release

This project has been migrated from release-please to semantic-release for automated releases.

## What Changed

### Added Files
- `.releaserc.json` - semantic-release configuration
- `.github/workflows/release.yml` - New release workflow

### Removed Files
- `.github/workflows/release-please.yml` - Old release-please workflow

### Modified Files
- `package.json` - Added semantic-release dependencies
- `PUBLISHING.md` - Updated release instructions
- `CONTRIBUTING.md` - Updated release process description
- `CHECKLIST.md` - Updated release steps

### Dependencies Added
```json
{
  "devDependencies": {
    "semantic-release": "^22.0.12",
    "@semantic-release/changelog": "^6.0.3",
    "@semantic-release/git": "^10.0.1"
  }
}
```

## semantic-release Configuration

Located in `.releaserc.json`:

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",      // Analyzes commits
    "@semantic-release/release-notes-generator", // Generates notes
    "@semantic-release/changelog",            // Updates CHANGELOG.md
    "@semantic-release/npm",                  // Publishes to npm
    "@semantic-release/git",                  // Commits back changes
    "@semantic-release/github"                // Creates GitHub release
  ]
}
```

## Release Workflow

### Old Process (release-please)
1. Push commits to main
2. release-please creates/updates a PR
3. Review PR
4. Merge PR → triggers release

### New Process (semantic-release)
1. Push commits to main
2. semantic-release automatically:
   - Analyzes commits
   - Determines version
   - Updates CHANGELOG.md
   - Updates package.json
   - Publishes to npm
   - Creates GitHub release
   - Commits changes back

**All in one automated step!**

## Advantages

✅ **Simpler**: No PR review needed  
✅ **Faster**: Immediate release on push to main  
✅ **Atomic**: Everything happens in one workflow run  
✅ **Standard**: Uses the de-facto standard tool  

## Usage

Same Conventional Commits format:

```bash
# Patch release (1.0.0 → 1.0.1)
git commit -m "fix: resolve bug"

# Minor release (1.0.0 → 1.1.0)  
git commit -m "feat: add feature"

# Major release (1.0.0 → 2.0.0)
git commit -m "feat!: breaking change

BREAKING CHANGE: removed old API"
```

Push to main:
```bash
git push origin main
```

That's it! semantic-release handles the rest.

## Skipping Release

Add `[skip ci]` to skip release:

```bash
git commit -m "docs: update README [skip ci]"
```

## First Release

The first commit with `feat:` or `fix:` will trigger v1.0.0:

```bash
git commit -m "feat: initial release"
git push origin main
```

## Verification

After pushing, check:
1. GitHub Actions → "Release" workflow
2. GitHub Releases → New release created
3. npm → Package published

```bash
npm view @sharedutils/semver
```

## Migration Complete ✅

The project is now ready to use semantic-release for all future releases.
