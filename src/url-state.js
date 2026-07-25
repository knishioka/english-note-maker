const BOOLEAN_VALUES = {
  true: true,
  false: false,
  1: true,
  0: false,
};

const DIFFICULTY_VALUES = ['auto', 'easy', 'normal', 'hard'];
const PHRASE_CATEGORY_VALUES = [
  'all',
  'greetings',
  'self_introduction',
  'school',
  'shopping',
  'travel',
  'feelings',
  'daily_life',
  'classroom_english',
  'friend_making',
  'cultural_exchange',
  'emergency_situations',
  'numbers_math',
  'family',
  'hobbies',
  'food_eating',
  'weather',
  'asking_for_help',
  'opinions_preferences',
  'making_plans',
  'apologizing_thanking',
  'health_body',
];

export const URL_STATE_PARAM_SPECS = {
  practiceMode: {
    elementId: 'practiceMode',
    type: 'enum',
    values: ['phrase', 'phonics', 'normal', 'sentence', 'word', 'alphabet', 'cloze'],
  },
  ageGroup: { elementId: 'ageGroup', type: 'enum', values: ['4-6', '7-9', '10-12'] },
  pageCount: { elementId: 'pageCount', type: 'integer', min: 1, max: 60 },
  lineHeight: { elementId: 'lineHeight', type: 'integer', values: [8, 10, 12] },
  lineColor: { elementId: 'lineColor', type: 'enum', values: ['gray', 'blue', 'green'] },
  showHeader: { elementId: 'showHeader', type: 'boolean' },
  showExamples: { elementId: 'showExamples', type: 'boolean' },
  showTranslation: { elementId: 'showTranslation', type: 'boolean' },
  exampleCategory: {
    elementId: 'exampleCategory',
    type: 'enum',
    values: ['all', 'daily', 'school', 'family', 'hobby'],
  },
  sentenceDifficulty: {
    elementId: 'sentenceDifficulty',
    type: 'enum',
    values: DIFFICULTY_VALUES,
  },
  wordCategory: {
    elementId: 'wordCategory',
    type: 'enum',
    values: [
      'animals',
      'food',
      'colors',
      'numbers',
      'calendar',
      'school_items',
      'body_parts',
      'weather',
      'classroom_objects',
      'subjects',
      'sports_activities',
      'emotions_advanced',
      'academic_words',
    ],
  },
  wordDifficulty: { elementId: 'wordDifficulty', type: 'enum', values: DIFFICULTY_VALUES },
  phraseCategory: { elementId: 'phraseCategory', type: 'enum', values: PHRASE_CATEGORY_VALUES },
  phraseDifficulty: { elementId: 'phraseDifficulty', type: 'enum', values: DIFFICULTY_VALUES },
  showSituation: { elementId: 'showSituation', type: 'boolean' },
  clozeCategory: { elementId: 'clozeCategory', type: 'enum', values: PHRASE_CATEGORY_VALUES },
  clozeBlankType: { elementId: 'clozeBlankType', type: 'enum', values: ['word', 'char'] },
  clozeDifficulty: { elementId: 'clozeDifficulty', type: 'enum', values: DIFFICULTY_VALUES },
  showClozeAnswers: { elementId: 'showClozeAnswers', type: 'boolean' },
  alphabetType: {
    elementId: 'alphabetType',
    type: 'enum',
    values: ['uppercase', 'lowercase', 'both'],
  },
  alphabetMode: { elementId: 'alphabetMode', type: 'enum', values: ['normal', 'trace'] },
  alphabetTraceRepeat: {
    elementId: 'alphabetTraceRepeat',
    type: 'integer',
    values: [1, 2, 3, 4, 5],
  },
  alphabetWordCount: { elementId: 'alphabetWordCount', type: 'integer', values: [1, 2, 3] },
  showAlphabetExample: { elementId: 'showAlphabetExample', type: 'boolean' },
  phonicsPattern: { elementId: 'phonicsPattern', type: 'select' },
};

export const URL_STATE_PARAM_KEYS = Object.keys(URL_STATE_PARAM_SPECS);
export const URL_STATE_ELEMENT_IDS = new Set(
  URL_STATE_PARAM_KEYS.map((key) => URL_STATE_PARAM_SPECS[key].elementId)
);

function normalizeSearchParams(input) {
  if (input instanceof globalThis.URLSearchParams) {
    return input;
  }

  return new globalThis.URLSearchParams(typeof input === 'string' ? input : '');
}

function getAllowedValues(spec, documentRef) {
  const element = documentRef?.getElementById?.(spec.elementId);
  const SelectElement = documentRef?.defaultView?.HTMLSelectElement;
  if (
    typeof SelectElement !== 'undefined' &&
    element instanceof SelectElement &&
    element.options.length > 0
  ) {
    return Array.from(element.options).map((option) => option.value);
  }

  return spec.values || [];
}

function sanitizeParamValue(key, rawValue, documentRef) {
  const spec = URL_STATE_PARAM_SPECS[key];
  if (!spec || rawValue === null || rawValue === undefined) {
    return undefined;
  }

  if (spec.type === 'boolean') {
    return BOOLEAN_VALUES[String(rawValue).toLowerCase()];
  }

  if (spec.type === 'integer') {
    const parsedValue = Number.parseInt(String(rawValue), 10);
    if (!Number.isFinite(parsedValue)) {
      return undefined;
    }

    if (Array.isArray(spec.values)) {
      return spec.values.includes(parsedValue) ? parsedValue : undefined;
    }

    if (parsedValue < spec.min || parsedValue > spec.max) {
      return undefined;
    }

    return parsedValue;
  }

  const stringValue = String(rawValue);
  const allowedValues = getAllowedValues(spec, documentRef);
  if (!allowedValues.length) {
    return undefined;
  }

  return allowedValues.includes(stringValue) ? stringValue : undefined;
}

export function parseUrlState(search = '', documentRef = globalThis.document) {
  const params = normalizeSearchParams(search);
  const state = {};

  URL_STATE_PARAM_KEYS.forEach((key) => {
    if (!params.has(key)) {
      return;
    }

    const value = sanitizeParamValue(key, params.get(key), documentRef);
    if (value !== undefined) {
      state[key] = value;
    }
  });

  return state;
}

function setElementValue(element, value) {
  const InputElement = element?.ownerDocument?.defaultView?.HTMLInputElement;
  if (
    typeof InputElement !== 'undefined' &&
    element instanceof InputElement &&
    element.type === 'checkbox'
  ) {
    element.checked = Boolean(value);
    return;
  }

  element.value = String(value);
}

function readElementValue(element) {
  const InputElement = element?.ownerDocument?.defaultView?.HTMLInputElement;
  if (
    typeof InputElement !== 'undefined' &&
    element instanceof InputElement &&
    element.type === 'checkbox'
  ) {
    return element.checked;
  }

  if (
    typeof InputElement !== 'undefined' &&
    element instanceof InputElement &&
    element.type === 'number'
  ) {
    const parsedValue = Number.parseInt(element.value, 10);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return element.value;
}

export function applyUrlStateToDocument(state, documentRef = globalThis.document) {
  const applied = {};

  URL_STATE_PARAM_KEYS.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(state, key)) {
      return;
    }

    const spec = URL_STATE_PARAM_SPECS[key];
    const element = documentRef?.getElementById?.(spec.elementId);
    if (!element) {
      return;
    }

    const sanitizedValue = sanitizeParamValue(key, state[key], documentRef);
    if (sanitizedValue === undefined) {
      return;
    }

    setElementValue(element, sanitizedValue);
    applied[key] = sanitizedValue;
  });

  return applied;
}

export function serializeUrlStateFromDocument(documentRef = globalThis.document) {
  const state = {};

  URL_STATE_PARAM_KEYS.forEach((key) => {
    const spec = URL_STATE_PARAM_SPECS[key];
    const element = documentRef?.getElementById?.(spec.elementId);
    if (!element) {
      return;
    }

    const value = readElementValue(element);
    const sanitizedValue = sanitizeParamValue(key, value, documentRef);
    if (sanitizedValue !== undefined) {
      state[key] = sanitizedValue;
    }
  });

  return state;
}

export function buildUrlSearchFromState(state) {
  const params = new globalThis.URLSearchParams();

  URL_STATE_PARAM_KEYS.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(state, key)) {
      return;
    }

    params.set(key, String(state[key]));
  });

  return params.toString();
}

export function serializeUrlStateToSearch(documentRef = globalThis.document) {
  return buildUrlSearchFromState(serializeUrlStateFromDocument(documentRef));
}
