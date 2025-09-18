/**
 * アプリケーション設定管理
 * 印刷レイアウト、統計データ等の中央管理
 */

export const CONFIG = {
  lineHeight: 10, // mm
  lineSpacing: 2, // mm
  pageMargin: {
    top: 10, // mm
    bottom: 10, // mm
    left: 10, // mm
    right: 10, // mm
  },
};

export const CONTENT_STATS = {
  lastUpdated: '2025-01-18',
  words: {
    total: 0,
    byCategory: {},
    byAge: { '4-6': 0, '7-9': 0, '10-12': 0 },
  },
  phrases: {
    total: 0,
    byCategory: {},
    byAge: { '4-6': 0, '7-9': 0, '10-12': 0 },
  },
  examples: {
    total: 0,
    byAge: { '4-6': 0, '7-9': 0, '10-12': 0 },
  },
};

// アプリケーション状態管理
export let customExamples = [];
export let currentExamples = [];
export let currentExampleIndices = {};

// 状態更新関数
export function setCustomExamples(examples) {
  customExamples = examples;
}

export function setCurrentExamples(examples) {
  currentExamples = examples;
}

export function setCurrentExampleIndices(indices) {
  currentExampleIndices = indices;
}

export function getCustomExamples() {
  return customExamples;
}

export function getCurrentExamples() {
  return currentExamples;
}

export function getCurrentExampleIndices() {
  return currentExampleIndices;
}
