import js from '@eslint/js';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.turbo/**',
      'test-results/**',
      'playwright-report/**',
      '**/*.ts',
      '**/*.tsx',
      '**/*.d.ts',
      '**/*-expansion.js',
      '**/*expansion*.js',
      'check-*.js',
      'capture-*.js',
      '**/*.backup',
      'eslint.config.js',
      'playwright.config.js',
      'vite.config.ts',
      'vitest.config.ts',
    ],
  },
  js.configs.recommended,
  {
    rules: {
      // コンソール使用を警告（開発時は許可、プロダクションでは警告）
      'no-console': 'warn',

      // 未使用変数を警告
      'no-unused-vars': 'warn',

      // 等価演算子の統一
      eqeqeq: 'error',

      // セミコロンの強制
      semi: ['error', 'always'],

      // インデント（2スペース）
      indent: ['error', 2, { SwitchCase: 1 }],

      // 引用符の統一（シングルクォート）
      quotes: ['error', 'single', { avoidEscape: true }],

      // 関数の前のスペース
      'space-before-function-paren': [
        'error',
        { anonymous: 'always', named: 'never', asyncArrow: 'always' },
      ],

      // オブジェクトの中のスペース
      'object-curly-spacing': ['error', 'always'],

      // 配列の中のスペース
      'array-bracket-spacing': ['error', 'never'],

      // 行末のスペースを禁止
      'no-trailing-spaces': 'error',

      // ファイル末尾に改行を要求
      'eol-last': 'error',

      // カンマ後のスペース
      'comma-spacing': ['error', { before: false, after: true }],

      // キーワード後のスペース
      'keyword-spacing': ['error', { before: true, after: true }],

      // ブロック内のスペース
      'space-in-parens': ['error', 'never'],

      // 演算子周りのスペース
      'space-infix-ops': 'error',

      // case文内での変数宣言
      'no-case-declarations': 'error',
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        performance: 'readonly',
        navigator: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        HTMLElement: 'readonly',
        DOMContentLoaded: 'readonly',
        getComputedStyle: 'readonly',
        MouseEvent: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
      },
    },
  },
  {
    files: ['src/**/*.js', 'script.js'],
    rules: {
      // アプリケーション固有のルール
      'no-var': 'error',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn',
    },
  },
  // Node.js環境のファイル（テストやビルドスクリプト）
  {
    files: [
      '*.config.js',
      '*.config.ts',
      'test/**/*.js',
      'tests/**/*.js',
      'check-*.js',
      'capture-*.js',
      '*-expansion.js',
      'expanded-*.js',
      'word-expansion.js',
      'phrase-expansion.js',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'writable',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  // Playwright テストファイル
  {
    files: ['tests/e2e/**/*.spec.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  // Vitest テストファイル
  {
    files: ['test/**/*.test.ts', 'test/**/*.test.js', 'src/**/*.test.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
      },
    },
  },
  // TypeScript設定ファイル
  {
    files: ['*.config.ts', 'vite.config.ts', 'vitest.config.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
  },
];
