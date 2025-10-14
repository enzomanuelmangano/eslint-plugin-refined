#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Release Script${NC}\n"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "Current version: ${GREEN}${CURRENT_VERSION}${NC}"

# Ask for new version
read -p "Enter new version (e.g., 0.0.2, 0.1.0, 1.0.0): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
  echo "❌ Version cannot be empty"
  exit 1
fi

# Update package.json version
echo -e "\n📝 Updating package.json to version ${GREEN}${NEW_VERSION}${NC}"
npm version $NEW_VERSION --no-git-tag-version

# Run tests
echo -e "\n🧪 Running tests..."
bun test

# Build
echo -e "\n🔨 Building..."
bun run build

# Generate prefilled release notes
RELEASE_NOTES_FILE=$(mktemp)
cat > $RELEASE_NOTES_FILE << EOF
# Release v${NEW_VERSION}

## What's New

-

## Bug Fixes

-

## Documentation

-

---
<!-- Delete sections that don't apply -->
EOF

# Ask user to edit release notes
echo -e "\n📋 Opening editor for release notes..."
${EDITOR:-vim} $RELEASE_NOTES_FILE

RELEASE_NOTES=$(cat $RELEASE_NOTES_FILE)
rm $RELEASE_NOTES_FILE

# Git commit and tag
echo -e "\n📦 Creating git commit and tag..."
git add package.json
git commit -m "chore: release v${NEW_VERSION}"
git tag -a "v${NEW_VERSION}" -m "${RELEASE_NOTES}"

# Ask for confirmation before publishing
echo -e "\n${BLUE}Ready to:${NC}"
echo "  1. Push to git remote"
echo "  2. Publish to npm"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Push to git
  echo -e "\n⬆️  Pushing to git..."
  git push && git push --tags

  # Publish to npm
  echo -e "\n📤 Publishing to npm..."
  npm publish

  echo -e "\n${GREEN}✅ Released v${NEW_VERSION} successfully!${NC}"
  echo -e "\nCreate GitHub release at: https://github.com/YOUR_USERNAME/YOUR_REPO/releases/new?tag=v${NEW_VERSION}"
else
  echo -e "\n❌ Release cancelled. To undo changes:"
  echo "  git reset --hard HEAD~1"
  echo "  git tag -d v${NEW_VERSION}"
  exit 1
fi
