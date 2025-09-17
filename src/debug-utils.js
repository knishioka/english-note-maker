/**
 * Debug Utilities Module
 *
 * Provides structured logging and debugging capabilities to replace console.log
 * Integrates with Playwright MCP for automated testing and visual debugging
 */

class DebugLogger {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.level = options.level || 'debug';
        this.prefix = options.prefix || '[ENM]'; // English Note Maker
        this.enableTimestamp = options.timestamp !== false;
        this.enableStackTrace = options.stackTrace || false;

        // Log levels
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            critical: 4
        };

        // Performance tracking
        this.performanceMarks = new Map();

        // Error collection for Playwright integration
        this.errors = [];
        this.warnings = [];

        // Initialize in development mode only
        this.isDevelopment = window.location.hostname === 'localhost' ||
                            window.location.hostname === '127.0.0.1';
    }

    /**
     * Core logging method with structured output
     */
    log(level, category, message, data = {}) {
        if (!this.enabled || !this.isDevelopment) return;

        const levelValue = this.levels[level] || 0;
        const currentLevelValue = this.levels[this.level] || 0;

        if (levelValue < currentLevelValue) return;

        const timestamp = this.enableTimestamp ? new Date().toISOString() : '';
        const logEntry = {
            timestamp,
            level,
            category,
            message,
            data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Store errors and warnings for Playwright
        if (level === 'error' || level === 'critical') {
            this.errors.push(logEntry);
        } else if (level === 'warn') {
            this.warnings.push(logEntry);
        }

        // Format console output
        const color = this.getColorForLevel(level);
        const prefix = `${this.prefix} [${level.toUpperCase()}] [${category}]`;

        console.group(`%c${prefix}`, `color: ${color}; font-weight: bold`);
        if (timestamp) console.log(`Time: ${timestamp}`);
        console.log(`Message: ${message}`);
        if (Object.keys(data).length > 0) {
            console.log('Data:', data);
        }
        if (this.enableStackTrace && (level === 'error' || level === 'critical')) {
            console.trace();
        }
        console.groupEnd();
    }

    /**
     * Convenience methods for different log levels
     */
    debug(category, message, data) {
        this.log('debug', category, message, data);
    }

    info(category, message, data) {
        this.log('info', category, message, data);
    }

    warn(category, message, data) {
        this.log('warn', category, message, data);
    }

    error(category, message, data) {
        this.log('error', category, message, data);
    }

    critical(category, message, data) {
        this.log('critical', category, message, data);
    }

    /**
     * Performance measurement utilities
     */
    startPerformance(markName) {
        this.performanceMarks.set(markName, performance.now());
        this.debug('PERFORMANCE', `Started measuring: ${markName}`);
    }

    endPerformance(markName) {
        if (!this.performanceMarks.has(markName)) {
            this.warn('PERFORMANCE', `No start mark found for: ${markName}`);
            return;
        }

        const startTime = this.performanceMarks.get(markName);
        const duration = performance.now() - startTime;
        this.performanceMarks.delete(markName);

        this.info('PERFORMANCE', `${markName} completed`, {
            duration: `${duration.toFixed(2)}ms`,
            threshold: duration > 100 ? 'SLOW' : 'OK'
        });

        return duration;
    }

    /**
     * Element state debugging
     */
    logElementState(selector, elementName) {
        const element = document.querySelector(selector);
        if (!element) {
            this.error('ELEMENT', `${elementName} not found`, { selector });
            return;
        }

        const computedStyle = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        this.debug('ELEMENT', `${elementName} state`, {
            selector,
            visible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden',
            display: computedStyle.display,
            opacity: computedStyle.opacity,
            dimensions: {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left
            },
            classes: element.className,
            id: element.id
        });
    }

    /**
     * Event debugging
     */
    logEvent(eventType, target, detail = {}) {
        this.debug('EVENT', `${eventType} triggered`, {
            target: target.id || target.className || target.tagName,
            detail,
            timestamp: Date.now()
        });
    }

    /**
     * Print layout debugging
     */
    logPrintLayout() {
        const printStyles = Array.from(document.styleSheets)
            .filter(sheet => {
                try {
                    return Array.from(sheet.cssRules).some(rule =>
                        rule.cssText && rule.cssText.includes('@media print')
                    );
                } catch (e) {
                    return false;
                }
            });

        this.info('PRINT', 'Print layout analysis', {
            printStylesheets: printStyles.length,
            pageSize: this.getPageSize(),
            margins: this.getPageMargins()
        });
    }

    /**
     * Get print page size from CSS
     */
    getPageSize() {
        // This would need actual CSS parsing in production
        return 'A4';
    }

    /**
     * Get print margins from CSS
     */
    getPageMargins() {
        // This would need actual CSS parsing in production
        return '10mm';
    }

    /**
     * Color coding for log levels
     */
    getColorForLevel(level) {
        const colors = {
            debug: '#888',
            info: '#2196F3',
            warn: '#FF9800',
            error: '#F44336',
            critical: '#B71C1C'
        };
        return colors[level] || '#000';
    }

    /**
     * Export logs for Playwright or testing
     */
    exportLogs() {
        return {
            errors: this.errors,
            warnings: this.warnings,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Clear collected logs
     */
    clearLogs() {
        this.errors = [];
        this.warnings = [];
    }
}

/**
 * Debug Panel for visual debugging in development
 */
class DebugPanel {
    constructor(logger) {
        this.logger = logger;
        this.panel = null;
        this.isVisible = false;
    }

    /**
     * Create and inject debug panel into page
     */
    init() {
        if (!this.logger.isDevelopment) return;

        this.createPanel();
        this.bindKeyboardShortcut();
        this.logger.info('DEBUG_PANEL', 'Debug panel initialized');
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.className = 'debug-panel';
        panel.innerHTML = `
            <div class="debug-panel-header">
                <h3>Debug Panel</h3>
                <button id="debug-panel-close">×</button>
            </div>
            <div class="debug-panel-content">
                <div class="debug-section">
                    <h4>Page State</h4>
                    <div id="debug-page-state"></div>
                </div>
                <div class="debug-section">
                    <h4>Active Elements</h4>
                    <div id="debug-active-elements"></div>
                </div>
                <div class="debug-section">
                    <h4>Performance</h4>
                    <div id="debug-performance"></div>
                </div>
                <div class="debug-section">
                    <h4>Errors & Warnings</h4>
                    <div id="debug-errors"></div>
                </div>
                <div class="debug-actions">
                    <button id="debug-refresh-state">Refresh State</button>
                    <button id="debug-export-logs">Export Logs</button>
                    <button id="debug-clear-logs">Clear Logs</button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .debug-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                max-height: 80vh;
                background: white;
                border: 2px solid #2196F3;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                z-index: 10000;
                display: none;
                font-family: monospace;
                font-size: 12px;
            }

            .debug-panel.visible {
                display: block;
            }

            .debug-panel-header {
                background: #2196F3;
                color: white;
                padding: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 6px 6px 0 0;
            }

            .debug-panel-header h3 {
                margin: 0;
                font-size: 14px;
            }

            #debug-panel-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
            }

            .debug-panel-content {
                padding: 15px;
                max-height: calc(80vh - 50px);
                overflow-y: auto;
            }

            .debug-section {
                margin-bottom: 15px;
                padding: 10px;
                background: #f5f5f5;
                border-radius: 4px;
            }

            .debug-section h4 {
                margin: 0 0 10px 0;
                color: #333;
                font-size: 12px;
                text-transform: uppercase;
            }

            .debug-actions {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }

            .debug-actions button {
                flex: 1;
                padding: 8px;
                background: #2196F3;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            }

            .debug-actions button:hover {
                background: #1976D2;
            }

            .debug-error {
                color: #F44336;
                margin: 5px 0;
            }

            .debug-warning {
                color: #FF9800;
                margin: 5px 0;
            }

            @media print {
                .debug-panel {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(panel);
        this.panel = panel;

        // Bind events
        document.getElementById('debug-panel-close').addEventListener('click', () => this.hide());
        document.getElementById('debug-refresh-state').addEventListener('click', () => this.refreshState());
        document.getElementById('debug-export-logs').addEventListener('click', () => this.exportLogs());
        document.getElementById('debug-clear-logs').addEventListener('click', () => this.clearLogs());
    }

    bindKeyboardShortcut() {
        // Ctrl+Shift+D to toggle debug panel
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    show() {
        if (this.panel) {
            this.panel.classList.add('visible');
            this.isVisible = true;
            this.refreshState();
        }
    }

    hide() {
        if (this.panel) {
            this.panel.classList.remove('visible');
            this.isVisible = false;
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    refreshState() {
        this.updatePageState();
        this.updateActiveElements();
        this.updatePerformance();
        this.updateErrors();
    }

    updatePageState() {
        const stateDiv = document.getElementById('debug-page-state');
        if (!stateDiv) return;

        const practiceMode = document.getElementById('practiceMode')?.value;
        const lineHeight = document.getElementById('lineHeight')?.value;
        const pageCount = document.getElementById('pageCount')?.value;

        stateDiv.innerHTML = `
            <div>Practice Mode: ${practiceMode || 'N/A'}</div>
            <div>Line Height: ${lineHeight || 'N/A'}mm</div>
            <div>Page Count: ${pageCount || 'N/A'}</div>
            <div>Window Size: ${window.innerWidth}x${window.innerHeight}</div>
        `;
    }

    updateActiveElements() {
        const elementsDiv = document.getElementById('debug-active-elements');
        if (!elementsDiv) return;

        const modal = document.querySelector('.print-preview-modal');
        const preview = document.querySelector('.note-preview');

        elementsDiv.innerHTML = `
            <div>Modal Visible: ${modal ? window.getComputedStyle(modal).display !== 'none' : false}</div>
            <div>Preview Elements: ${preview ? preview.children.length : 0}</div>
            <div>Active Element: ${document.activeElement?.tagName || 'None'}</div>
        `;
    }

    updatePerformance() {
        const perfDiv = document.getElementById('debug-performance');
        if (!perfDiv) return;

        const memory = performance.memory ?
            `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)}MB` :
            'N/A';

        perfDiv.innerHTML = `
            <div>Memory Usage: ${memory}</div>
            <div>DOM Nodes: ${document.getElementsByTagName('*').length}</div>
        `;
    }

    updateErrors() {
        const errorsDiv = document.getElementById('debug-errors');
        if (!errorsDiv) return;

        const logs = this.logger.exportLogs();

        let html = '';
        logs.errors.forEach(error => {
            html += `<div class="debug-error">❌ ${error.message}</div>`;
        });
        logs.warnings.forEach(warning => {
            html += `<div class="debug-warning">⚠️ ${warning.message}</div>`;
        });

        if (!html) {
            html = '<div>No errors or warnings</div>';
        }

        errorsDiv.innerHTML = html;
    }

    exportLogs() {
        const logs = this.logger.exportLogs();
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.logger.info('DEBUG_PANEL', 'Logs exported');
    }

    clearLogs() {
        this.logger.clearLogs();
        this.refreshState();
        this.logger.info('DEBUG_PANEL', 'Logs cleared');
    }
}

// Create global debug instance
const debugLogger = new DebugLogger({
    enabled: true,
    level: 'debug',
    timestamp: true,
    stackTrace: false
});

const debugPanel = new DebugPanel(debugLogger);

// Export for use in other modules
window.Debug = {
    logger: debugLogger,
    panel: debugPanel,

    // Convenience methods
    log: (category, message, data) => debugLogger.info(category, message, data),
    error: (category, message, data) => debugLogger.error(category, message, data),
    warn: (category, message, data) => debugLogger.warn(category, message, data),
    debug: (category, message, data) => debugLogger.debug(category, message, data),

    // Performance helpers
    startTimer: (name) => debugLogger.startPerformance(name),
    endTimer: (name) => debugLogger.endPerformance(name),

    // Element helpers
    logElement: (selector, name) => debugLogger.logElementState(selector, name),

    // Event helpers
    logEvent: (type, target, detail) => debugLogger.logEvent(type, target, detail),

    // Initialize debug panel
    init: () => debugPanel.init()
};

// Auto-initialize in development
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Debug.init();
        Debug.log('INIT', 'Debug utilities loaded');
    });
} else {
    Debug.init();
    Debug.log('INIT', 'Debug utilities loaded');
}

// Export for CommonJS environments (removed ES modules export)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { debugLogger, debugPanel };
}