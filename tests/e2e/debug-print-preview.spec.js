/**
 * Playwright Debug Tests for Print Preview Functionality
 *
 * These tests demonstrate how to use Playwright for debugging
 * UI interactions and visibility issues
 */

import { test, expect } from '@playwright/test';

test.describe('Print Preview Debugging', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Start capturing console messages
    page.on('console', msg => {
      console.log(`Browser console [${msg.type()}]: ${msg.text()}`);
    });

    // Capture any errors
    page.on('pageerror', error => {
      console.error(`Page error: ${error.message}`);
    });
  });

  test('debug print preview button visibility and interaction', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/initial-state.png', fullPage: true });

    // Check if print preview button exists
    const printPreviewBtn = page.locator('#previewBtn');
    await expect(printPreviewBtn).toBeVisible();

    // Log button properties
    const buttonInfo = await printPreviewBtn.evaluate(el => ({
      id: el.id,
      text: el.textContent,
      className: el.className,
      disabled: el.disabled,
      display: window.getComputedStyle(el).display,
      visibility: window.getComputedStyle(el).visibility,
      hasClickHandler: el.onclick !== null || el.hasAttribute('onclick')
    }));

    console.log('Print Preview Button Info:', buttonInfo);

    // Check modal initial state
    const modal = page.locator('#printPreviewModal');
    const modalInitialState = await modal.evaluate(el => ({
      display: window.getComputedStyle(el).display,
      opacity: window.getComputedStyle(el).opacity,
      visibility: window.getComputedStyle(el).visibility,
      className: el.className
    }));

    console.log('Modal Initial State:', modalInitialState);

    // Click the print preview button
    await printPreviewBtn.click();

    // Wait a moment for any animations
    await page.waitForTimeout(500);

    // Check modal state after click
    const modalAfterClick = await modal.evaluate(el => ({
      display: window.getComputedStyle(el).display,
      opacity: window.getComputedStyle(el).opacity,
      visibility: window.getComputedStyle(el).visibility,
      className: el.className,
      classList: Array.from(el.classList)
    }));

    console.log('Modal After Click:', modalAfterClick);

    // Take screenshot after click
    await page.screenshot({ path: 'test-results/after-click.png', fullPage: true });

    // Verify modal is visible
    await expect(modal).toBeVisible();

    // Check if modal content is populated
    const modalContent = page.locator('#a4Preview');
    const hasContent = await modalContent.evaluate(el => el.children.length > 0);

    expect(hasContent).toBeTruthy();
    console.log('Modal has content:', hasContent);

    // Test close button
    const closeBtn = page.locator('#closePreviewBtn');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Verify modal is hidden after close
    await expect(modal).not.toBeVisible();
  });

  test('debug CSS variables and styles', async ({ page }) => {
    // Check if required CSS variables are defined
    const cssVariables = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        bgColor: root.getPropertyValue('--bg-color'),
        textColor: root.getPropertyValue('--text-color'),
        borderColor: root.getPropertyValue('--border-color'),
        primaryColor: root.getPropertyValue('--primary-color'),
        secondaryColor: root.getPropertyValue('--secondary-color')
      };
    });

    console.log('CSS Variables:', cssVariables);

    // Check for any missing CSS variables
    Object.entries(cssVariables).forEach(([key, value]) => {
      if (!value || value.trim() === '') {
        console.error(`Missing CSS variable: --${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      }
    });

    // Check if print styles are loaded
    const hasPrintStyles = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      return sheets.some(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          return rules.some(rule => rule.cssText && rule.cssText.includes('@media print'));
        } catch (e) {
          return false;
        }
      });
    });

    expect(hasPrintStyles).toBeTruthy();
    console.log('Has print styles:', hasPrintStyles);
  });

  test('debug event listeners', async ({ page }) => {
    // Check all event listeners on the print preview button
    const eventListeners = await page.evaluate(() => {
      const btn = document.getElementById('previewBtn');
      if (!btn) return null;

      // Try to get event listeners (this is limited in what it can detect)
      const listeners = {
        onclick: btn.onclick !== null,
        hasEventListener: btn.getAttribute('onclick') !== null
      };

      // Check if addEventListener was called (we can't directly access these)
      // But we can test if clicking triggers something
      const testClick = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });

      // Store console.log to check if it's called
      const originalLog = console.log;
      let logCalled = false;
      console.log = function() {
        logCalled = true;
        originalLog.apply(console, arguments);
      };

      btn.dispatchEvent(testClick);
      console.log = originalLog;

      listeners.triggersConsoleLog = logCalled;

      return listeners;
    });

    console.log('Event Listeners:', eventListeners);
  });

  test('debug modal animation and transitions', async ({ page }) => {
    const modal = page.locator('#printPreviewModal');

    // Get transition/animation properties
    const animationProps = await modal.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        transition: styles.transition,
        animation: styles.animation,
        transform: styles.transform,
        opacity: styles.opacity,
        display: styles.display
      };
    });

    console.log('Modal Animation Properties:', animationProps);

    // Click preview button and track state changes
    await page.locator('#previewBtn').click();

    // Monitor modal state changes over time
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(100);

      const state = await modal.evaluate(el => ({
        time: i * 100,
        display: window.getComputedStyle(el).display,
        opacity: window.getComputedStyle(el).opacity,
        classList: Array.from(el.classList)
      }));

      console.log(`Modal state at ${state.time}ms:`, state);
    }
  });

  test('capture network requests during interaction', async ({ page }) => {
    // Monitor network requests
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });

    // Interact with the page
    await page.click('#previewBtn');
    await page.waitForTimeout(1000);

    console.log('Network Requests:', requests);
  });

  test('validate print layout structure', async ({ page }) => {
    // Generate print preview
    await page.click('#previewBtn');
    await page.waitForSelector('.print-preview-modal.modal-visible');

    // Check print preview structure
    const previewStructure = await page.evaluate(() => {
      const preview = document.getElementById('a4Preview');
      if (!preview) return null;

      const lines = preview.querySelectorAll('.baseline-group');
      const examples = preview.querySelectorAll('.example-sentence');

      return {
        hasContent: preview.children.length > 0,
        lineCount: lines.length,
        exampleCount: examples.length,
        innerHTML: preview.innerHTML.substring(0, 200) // First 200 chars for inspection
      };
    });

    console.log('Preview Structure:', previewStructure);
    expect(previewStructure.hasContent).toBeTruthy();
  });
});

test.describe('Performance Debugging', () => {
  test('measure rendering performance', async ({ page }) => {
    await page.goto('/');

    // Measure page load performance
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive,
        domComplete: perfData.domComplete
      };
    });

    console.log('Performance Metrics:', performanceMetrics);

    // Measure specific operations
    await page.evaluate(() => {
      performance.mark('preview-start');
    });

    await page.click('#previewBtn');
    await page.waitForSelector('.print-preview-modal.modal-visible');

    await page.evaluate(() => {
      performance.mark('preview-end');
      performance.measure('preview-render', 'preview-start', 'preview-end');
    });

    const measurements = await page.evaluate(() => {
      const measure = performance.getEntriesByName('preview-render')[0];
      return {
        duration: measure.duration,
        startTime: measure.startTime
      };
    });

    console.log('Preview Render Time:', measurements);
  });

  test('debug memory usage', async ({ page }) => {
    await page.goto('/');

    // Check initial memory usage
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB',
          totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + 'MB'
        };
      }
      return null;
    });

    console.log('Initial Memory:', initialMemory);

    // Perform operations
    for (let i = 0; i < 5; i++) {
      await page.click('#previewBtn');
      await page.waitForTimeout(100);
      await page.click('#closePreviewBtn');
      await page.waitForTimeout(100);
    }

    // Check memory after operations
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB',
          totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + 'MB'
        };
      }
      return null;
    });

    console.log('Final Memory:', finalMemory);
  });
});