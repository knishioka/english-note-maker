import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    rules: {
      // コンソール使用を警告（開発時は許可、プロダクションでは警告）
      'no-console': 'warn',

      // 未使用変数を警告
      'no-unused-vars': 'warn',

      // 等価演算子の統一
      'eqeqeq': 'error',

      // セミコロンの強制
      'semi': ['error', 'always'],

      // インデント（2スペース）
      'indent': ['error', 2],

      // 引用符の統一（シングルクォート）
      'quotes': ['error', 'single'],

      // 関数の前のスペース
      'space-before-function-paren': ['error', 'never'],

      // オブジェクトの中のスペース
      'object-curly-spacing': ['error', 'always'],

      // 配列の中のスペース
      'array-bracket-spacing': ['error', 'never'],

      // 行末のスペースを禁止
      'no-trailing-spaces': 'error',

      // ファイル末尾に改行を要求
      'eol-last': 'error',

      // カンマ後のスペース
      'comma-spacing': ['error', { 'before': false, 'after': true }],

      // キーワード後のスペース
      'keyword-spacing': ['error', { 'before': true, 'after': true }],

      // ブロック内のスペース
      'space-in-parens': ['error', 'never'],

      // 演算子周りのスペース
      'space-infix-ops': 'error'
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
        DOMContentLoaded: 'readonly'
      }
    }
  },
  {
    files: ['src/**/*.js', 'script.js'],
    rules: {
      // アプリケーション固有のルール
      'no-var': 'error',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn'
    }
  }
];
