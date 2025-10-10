// グローバル型定義

interface Window {
  Debug: {
    log: (category: string, message: string, data?: any) => void;
    error: (category: string, message: string, data?: any) => void;
    warn: (category: string, message: string, data?: any) => void;
    info: (category: string, message: string, data?: any) => void;
    debug: (category: string, message: string, data?: any) => void;
    startTimer: (name: string) => void;
    endTimer: (name: string) => number;
    logEvent: (event: string, target: any, data?: any) => void;
    logger: {
      exportLogs: () => {
        errors: any[];
        warnings: any[];
        info: any[];
        debug: any[];
      };
    };
    panel: any;
  };
  LayoutValidator: new () => {
    generateReport: () => {
      summary: {
        passed: number;
        failed: number;
        skipped: number;
      };
      errors: Array<{
        rule: string;
        message: string;
        actualValue: string;
        expectedRange: string;
      }>;
      warnings: Array<{
        rule: string;
        message: string;
        actualValue: string;
        expectedRange: string;
      }>;
    };
  };
  testPDFLayout: () => any;
  checkLayoutConsistency: () => any;
  validateConfiguration: () => any;
}
