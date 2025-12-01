# Setup Checklist for Publishing

Use this checklist to prepare and publish ghsemver to npm.

## Pre-Publishing Checklist

### 1. Code Preparation
- [x] All source code in `src/` directory
- [x] TypeScript configuration complete (`tsconfig.json`)
- [x] Build script works (`npm run build`)
- [x] CLI executable marked in package.json

### 2. Documentation
- [x] README.md with usage instructions
- [x] CHANGELOG.md created (will be auto-updated)
- [x] LICENSE file included
- [x] CONTRIBUTING.md for contributors
- [x] PUBLISHING.md for maintainers

### 3. Package Configuration
- [x] package.json properly configured:
  - [x] Name: `ghsemver`
  - [x] Description in English
  - [x] Keywords for discoverability
  - [x] Repository URL
  - [x] License (ISC)
  - [x] Files to publish (dist, README, LICENSE, CHANGELOG)
  - [x] Bin entry for CLI
  - [x] Engines requirement (Node >= 18)
  - [x] Public access configured

### 4. GitHub Setup
- [ ] Repository created at https://github.com/shared-utils/semver
- [ ] Push code to GitHub:
  ```bash
  git remote add origin https://github.com/shared-utils/semver.git
  git branch -M main
  git push -u origin main
  ```

### 5. npm Setup
- [ ] Create npm account at https://www.npmjs.com/
- [ ] Verify email address
- [ ] Check package name availability:
  ```bash
  npm view ghsemver
  ```
  (Should show "npm ERR! 404 Not Found" if available)

### 6. GitHub Secrets
- [ ] Create npm Access Token:
  - Go to https://www.npmjs.com/settings/[username]/tokens
  - Generate "Automation" token
- [ ] Add to GitHub repository:
  - Settings → Secrets and variables → Actions
  - New secret: `NPM_TOKEN` = your token

### 7. GitHub Workflows
- [x] CI workflow (`.github/workflows/ci.yml`) - Tests build
- [x] Release workflow (`.github/workflows/release.yml`) - Auto release with semantic-release

## First Release Steps

### Using semantic-release (Recommended)

1. Commit and push your code:
```bash
git add .
git commit -m "feat: initial release"
git push origin main
```

2. semantic-release will automatically:
   - Analyze commits
   - Determine version (1.0.0 for first release)
   - Update CHANGELOG.md
   - Publish to npm
   - Create GitHub release
   - Commit version changes back

3. Watch the release process:
   - Check Actions tab on GitHub
   - Wait for "Release" workflow to complete

4. Verify publication:
```bash
npm view ghsemver
npx ghsemver --help
```

1. Build the project:
```bash
npm run build
```

2. Login to npm:
```bash
npm login
```

3. Publish:
```bash
npm publish --access public
```

4. Create git tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Post-Publishing

### Verify Package
- [ ] Check on npm: https://www.npmjs.com/package/ghsemver
- [ ] Test installation:
  ```bash
  npx ghsemver --help
  ```

### Update Documentation
- [ ] Add badge to README:
  ```markdown
  [![npm version](https://badge.fury.io/js/ghsemver.svg)](https://www.npmjs.com/package/ghsemver)
  ```

### Announce
- [ ] Create GitHub release with release notes
- [ ] Share on relevant channels (optional)

## Ongoing Maintenance

### For New Releases

1. Make changes using Conventional Commits:
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
```

2. Push to main:
```bash
git push origin main
```

3. semantic-release will automatically:
   - Analyze commits
   - Bump version
   - Update CHANGELOG
   - Publish to npm
   - Create GitHub release

All in one workflow run!

### Troubleshooting

**Q: Release not created?**
- Ensure commits use Conventional Commits format
- Check GitHub Actions are enabled
- Verify commits contain release-triggering types (`feat`, `fix`)
- Check Actions logs for errors

**Q: npm publish fails?**
- Check `NPM_TOKEN` is set correctly
- Verify token has correct permissions
- Ensure package name is available/owned by you

**Q: Build fails?**
- Run `npm run build` locally
- Check TypeScript errors
- Verify all dependencies in package.json

## Quick Commands Reference

```bash
# Build
npm run build

# Test CLI locally
ghsemver --help
ghsemver current
ghsemver next

# Pack (dry run)
npm pack --dry-run

# Publish manually
npm publish --access public

# View published package
npm view ghsemver
```

## Support

Need help? Open an issue:
https://github.com/shared-utils/semver/issues

