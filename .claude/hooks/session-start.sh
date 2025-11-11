#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the Web (remote environment)
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  echo "Skipping session start hook (not in remote environment)"
  exit 0
fi

echo "=========================================="
echo "Starting Claude Code Web Session Setup"
echo "=========================================="

# Install npm dependencies
echo "Installing npm dependencies..."
# Skip Puppeteer browser download in remote environment (Playwright handles browser needs)
export PUPPETEER_SKIP_DOWNLOAD=true
if npm install; then
  echo "✅ Dependencies installed successfully"
else
  echo "❌ Failed to install dependencies"
  exit 1
fi

# Install Playwright browsers if not already installed
if [ -d "node_modules/@playwright/test" ]; then
  echo "Installing Playwright browsers..."
  # Install all browsers configured in playwright.config.js (chromium, firefox, webkit)
  if npx playwright install --with-deps chromium firefox webkit; then
    echo "✅ Playwright browsers installed successfully (chromium, firefox, webkit)"
  else
    echo "⚠️  Warning: Failed to install Playwright browsers (e2e tests may not work)"
  fi
fi

echo "=========================================="
echo "Session setup completed successfully!"
echo "=========================================="
echo ""
echo "Available commands:"
echo "  npm run dev         - Start development server (Vite)"
echo "  npm run lint        - Run ESLint"
echo "  npm run test        - Run unit tests (Vitest)"
echo "  npm run test:e2e    - Run end-to-end tests (Playwright)"
echo "  npm run build       - Build for production"
echo ""
