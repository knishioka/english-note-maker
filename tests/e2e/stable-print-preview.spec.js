/**
 * Stable Print Preview Tests
 *
 * 一時的な問題を回避した安定したテスト実装
 */

import { test, expect } from '@playwright/test';

test.describe('Stable Print Preview Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for complete page load including all resources
    await page.waitForLoadState('networkidle');

    // Wait for debug utilities to be loaded
    await page.waitForFunction(() => window.Debug !== undefined, { timeout: 10000 });

    // Capture console messages for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Browser error: ${msg.text()}`);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.error(`Page error: ${error.message}`);
    });
  });

  test('print preview modal shows and hides correctly', async ({ page }) => {
    // Verify initial state
    const modal = page.locator('#printPreviewModal');
    await expect(modal).not.toBeVisible();

    // Verify button exists and is clickable
    const previewBtn = page.locator('#previewBtn');
    await expect(previewBtn).toBeVisible();
    await expect(previewBtn).toBeEnabled();

    // Click preview button
    await previewBtn.click();

    // Wait for modal animation to complete
    await page.waitForFunction(() => {
      const modal = document.querySelector('#printPreviewModal');
      if (!modal) return false;

      const styles = window.getComputedStyle(modal);
      return styles.display === 'flex' && parseFloat(styles.opacity) > 0.9;
    }, { timeout: 5000 });

    // Verify modal is visible
    await expect(modal).toBeVisible();

    // Verify modal content is populated
    const previewContent = page.locator('#a4Preview');
    await expect(previewContent).toBeVisible();

    // Verify close button is visible
    const closeBtn = page.locator('#closePreviewBtn');
    await expect(closeBtn).toBeVisible();

    // Close modal
    await closeBtn.click();

    // Wait for modal to be hidden
    await page.waitForFunction(() => {
      const modal = document.querySelector('#printPreviewModal');
      if (!modal) return true;

      const styles = window.getComputedStyle(modal);
      return styles.display === 'none' || parseFloat(styles.opacity) === 0;
    }, { timeout: 5000 });

    // Verify modal is hidden
    await expect(modal).not.toBeVisible();
  });

  test('debug utilities are functioning correctly', async ({ page }) => {
    // Verify Debug utilities are loaded
    const debugAvailable = await page.evaluate(() => {
      return {
        debugExists: typeof window.Debug !== 'undefined',
        loggerExists: window.Debug?.logger !== undefined,
        panelExists: window.Debug?.panel !== undefined
      };
    });

    expect(debugAvailable.debugExists).toBeTruthy();
    expect(debugAvailable.loggerExists).toBeTruthy();
    expect(debugAvailable.panelExists).toBeTruthy();

    // Test debug logging
    await page.evaluate(() => {
      window.Debug.log('TEST', 'Playwright test message', { source: 'automated-test' });
    });

    // Verify logs can be exported
    const logs = await page.evaluate(() => {
      return window.Debug.logger.exportLogs();
    });

    expect(logs).toBeDefined();
    expect(Array.isArray(logs.errors)).toBeTruthy();
    expect(Array.isArray(logs.warnings)).toBeTruthy();
  });

  test('page navigation and controls work correctly', async ({ page }) => {
    // Test practice mode selection
    const practiceModeSelect = page.locator('#practiceMode');
    await expect(practiceModeSelect).toBeVisible();

    // Change to different practice mode
    await practiceModeSelect.selectOption('word');

    // Verify word options become visible
    await expect(page.locator('#wordOptions')).toBeVisible();

    // Change back to phrase mode
    await practiceModeSelect.selectOption('phrase');

    // Verify phrase options become visible
    await expect(page.locator('#phraseOptions')).toBeVisible();

    // Test line height selection
    const lineHeightSelect = page.locator('#lineHeight');
    await lineHeightSelect.selectOption('12');

    // Test page count input
    const pageCountInput = page.locator('#pageCount');
    await pageCountInput.fill('2');

    // Verify preview updates (check for presence of content)
    const notePreview = page.locator('#notePreview');
    await expect(notePreview).toBeVisible();
  });

  test('keyboard shortcuts work correctly', async ({ page }) => {
    // Test debug panel shortcut (Ctrl+Shift+D)
    await page.keyboard.press('Control+Shift+KeyD');

    // Wait for debug panel to appear
    await page.waitForFunction(() => {
      const panel = document.querySelector('#debug-panel');
      return panel && window.getComputedStyle(panel).display !== 'none';
    }, { timeout: 3000 });

    const debugPanel = page.locator('#debug-panel');
    await expect(debugPanel).toBeVisible();

    // Close debug panel
    await page.locator('#debug-panel-close').click();
    await expect(debugPanel).not.toBeVisible();
  });

  test('performance monitoring works', async ({ page }) => {
    // Start performance measurement
    await page.evaluate(() => {
      window.Debug.startTimer('test-operation');
    });

    // Perform some operation
    await page.click('#previewBtn');
    await page.waitForSelector('#printPreviewModal', { state: 'visible' });

    // End performance measurement
    const duration = await page.evaluate(() => {
      return window.Debug.endTimer('test-operation');
    });

    expect(typeof duration).toBe('number');
    expect(duration).toBeGreaterThan(0);

    // Close modal
    await page.click('#closePreviewBtn');
  });

  test('error handling and logging', async ({ page }) => {
    let errorCaught = false;

    // Listen for page errors
    page.on('pageerror', (error) => {
      console.log('Caught page error:', error.message);
      errorCaught = true;
    });

    // Test error logging
    await page.evaluate(() => {
      window.Debug.error('TEST', 'Test error message', {
        testError: true,
        timestamp: Date.now()
      });
    });

    // Verify error was logged
    const logs = await page.evaluate(() => {
      return window.Debug.logger.exportLogs();
    });

    expect(logs.errors.length).toBeGreaterThan(0);

    const testError = logs.errors.find(error =>
      error.data && error.data.testError === true
    );
    expect(testError).toBeDefined();
  });
});

test.describe('Cross-browser compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`print preview works in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      test.skip(currentBrowser !== browserName, `Skipping ${browserName} test`);

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Basic functionality test
      await page.click('#previewBtn');

      // Wait for modal with longer timeout for slower browsers
      await page.waitForSelector('#printPreviewModal', {
        state: 'visible',
        timeout: 10000
      });

      await expect(page.locator('#printPreviewModal')).toBeVisible();

      // Clean up
      await page.click('#closePreviewBtn');
    });
  });
});