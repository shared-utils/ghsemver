# Contributing to ghsemver

Thank you for your interest in contributing!

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/shared-utils/semver.git
cd semver
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Link locally for testing:
```bash
npm link
```

## Making Changes

1. Create a new branch:
```bash
git checkout -b feature/your-feature
```

2. Make your changes in the `src/` directory

3. Build and test:
```bash
npm run build
ghsemver --help
```

4. Commit using Conventional Commits:
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update README"
```

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes

Breaking changes:
```bash
git commit -m "feat!: breaking change

BREAKING CHANGE: description of the breaking change"
```

## Pull Request Process

1. Push your branch to GitHub
2. Create a pull request
3. Ensure CI passes
4. Wait for review

## Release Process

We use [semantic-release](https://github.com/semantic-release/semantic-release) for automated releases.

When commits are pushed to `main`:
1. semantic-release analyzes commits
2. Determines version bump based on commit types
3. Updates CHANGELOG.md
4. Bumps version in package.json
5. Publishes to npm
6. Creates GitHub release
7. Commits changes back to main

All happens automatically in one workflow run!

## Questions?

Feel free to open an issue for questions or discussions.

