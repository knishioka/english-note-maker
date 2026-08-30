import { describe, expect, it } from 'vitest';
import {
  applyUrlStateToDocument,
  buildUrlSearchFromState,
  parseUrlState,
  serializeUrlStateFromDocument,
  serializeUrlStateToSearch,
} from '../src/url-state.js';

function appendControl(id, tagName, values, initialValue = values[0]) {
  const element = document.createElement(tagName);
  element.id = id;

  if (tagName === 'select') {
    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      element.appendChild(option);
    });
  }

  if (tagName === 'input') {
    element.type = values.type;
    if (values.type === 'checkbox') {
      element.checked = Boolean(initialValue);
    } else {
      element.value = String(initialValue);
      if (values.min) element.min = String(values.min);
      if (values.max) element.max = String(values.max);
    }
  } else {
    element.value = String(initialValue);
  }

  document.body.appendChild(element);
  return element;
}

function setupWorksheetControls() {
  appendControl('practiceMode', 'select', [
    'phrase',
    'phonics',
    'normal',
    'sentence',
    'word',
    'alphabet',
    'cloze',
    'sightWords',
  ]);
  appendControl('ageGroup', 'select', ['4-6', '7-9', '10-12'], '7-9');
  appendControl('pageCount', 'input', { type: 'number', min: 1, max: 60 }, 1);
  appendControl('lineHeight', 'select', ['8', '10', '12'], '10');
  appendControl('lineColor', 'select', ['gray', 'blue', 'green'], 'gray');
  appendControl('showHeader', 'input', { type: 'checkbox' }, false);
  appendControl('showExamples', 'input', { type: 'checkbox' }, true);
  appendControl('showTranslation', 'input', { type: 'checkbox' }, false);
  appendControl('exampleCategory', 'select', ['all', 'daily', 'school', 'family', 'hobby'], 'all');
  appendControl('sentenceDifficulty', 'select', ['auto', 'easy', 'normal', 'hard'], 'auto');
  appendControl('wordCategory', 'select', ['animals', 'food', 'academic_words'], 'animals');
  appendControl('wordDifficulty', 'select', ['auto', 'easy', 'normal', 'hard'], 'auto');
  appendControl('phraseCategory', 'select', ['all', 'greetings', 'numbers_math'], 'all');
  appendControl('phraseDifficulty', 'select', ['auto', 'easy', 'normal', 'hard'], 'auto');
  appendControl('showSituation', 'input', { type: 'checkbox' }, true);
  appendControl('clozeCategory', 'select', ['all', 'greetings', 'numbers_math'], 'all');
  appendControl('clozeBlankType', 'select', ['word', 'char'], 'word');
  appendControl('clozeDifficulty', 'select', ['auto', 'easy', 'normal', 'hard'], 'auto');
  appendControl('showClozeAnswers', 'input', { type: 'checkbox' }, false);
  appendControl('alphabetType', 'select', ['uppercase', 'lowercase', 'both'], 'uppercase');
  appendControl('alphabetMode', 'select', ['normal', 'trace'], 'normal');
  appendControl('alphabetTraceRepeat', 'select', ['1', '2', '3', '4', '5'], '3');
  appendControl('alphabetWordCount', 'select', ['1', '2', '3'], '2');
  appendControl('showAlphabetExample', 'input', { type: 'checkbox' }, true);
  appendControl('phonicsPattern', 'select', ['short-a', 'long-a'], 'short-a');
  appendControl('sightWordCount', 'select', ['4', '6', '8'], '6');
}

describe('url-state', () => {
  it('parses and sanitizes supported query parameters', () => {
    setupWorksheetControls();

    expect(
      parseUrlState(
        '?practiceMode=word&ageGroup=10-12&pageCount=4&lineHeight=12&showHeader=true&wordCategory=food&wordDifficulty=hard&unknown=value'
      )
    ).toEqual({
      practiceMode: 'word',
      ageGroup: '10-12',
      pageCount: 4,
      lineHeight: 12,
      showHeader: true,
      wordCategory: 'food',
      wordDifficulty: 'hard',
    });
  });

  it('ignores invalid, unknown, and out-of-range values without throwing', () => {
    setupWorksheetControls();

    expect(
      parseUrlState(
        '?practiceMode=essay&pageCount=999&lineHeight=11&showHeader=maybe&wordCategory=missing&alphabetTraceRepeat=9&unknown=value'
      )
    ).toEqual({});
  });

  it('hydrates major UI state from a sanitized URL state object', () => {
    setupWorksheetControls();
    const state = parseUrlState(
      '?practiceMode=alphabet&ageGroup=4-6&pageCount=3&lineColor=blue&showHeader=1&alphabetType=both&alphabetMode=trace&alphabetTraceRepeat=5&alphabetWordCount=1&showAlphabetExample=0'
    );

    const applied = applyUrlStateToDocument(state);

    expect(applied).toMatchObject({
      practiceMode: 'alphabet',
      ageGroup: '4-6',
      pageCount: 3,
      lineColor: 'blue',
      showHeader: true,
      alphabetType: 'both',
      alphabetMode: 'trace',
      alphabetTraceRepeat: 5,
      alphabetWordCount: 1,
      showAlphabetExample: false,
    });
    expect(document.getElementById('practiceMode').value).toBe('alphabet');
    expect(document.getElementById('pageCount').value).toBe('3');
    expect(document.getElementById('showHeader').checked).toBe(true);
    expect(document.getElementById('showAlphabetExample').checked).toBe(false);
  });

  it('serializes current UI state into stable shareable query parameters', () => {
    setupWorksheetControls();
    applyUrlStateToDocument(
      parseUrlState(
        '?practiceMode=cloze&ageGroup=10-12&pageCount=2&lineHeight=8&lineColor=green&showTranslation=true&clozeCategory=numbers_math&clozeBlankType=char&clozeDifficulty=easy&showClozeAnswers=true'
      )
    );

    const state = serializeUrlStateFromDocument();
    const search = serializeUrlStateToSearch();

    expect(state).toMatchObject({
      practiceMode: 'cloze',
      ageGroup: '10-12',
      pageCount: 2,
      lineHeight: 8,
      lineColor: 'green',
      showTranslation: true,
      clozeCategory: 'numbers_math',
      clozeBlankType: 'char',
      clozeDifficulty: 'easy',
      showClozeAnswers: true,
    });
    expect(search).toContain('practiceMode=cloze');
    expect(search).toContain('clozeBlankType=char');
    expect(search).not.toContain('unknown=');
  });

  it('round-trips sanitized state without storing random order or custom example text', () => {
    const state = {
      practiceMode: 'sentence',
      ageGroup: '7-9',
      pageCount: 5,
      showExamples: true,
      showTranslation: false,
      exampleCategory: 'school',
      sentenceDifficulty: 'normal',
      customEnglish: 'Do not serialize me',
      shuffleSeed: 'abc123',
    };

    const search = buildUrlSearchFromState(state);
    const parsed = parseUrlState(search);

    expect(parsed).toEqual({
      practiceMode: 'sentence',
      ageGroup: '7-9',
      pageCount: 5,
      showExamples: true,
      showTranslation: false,
      exampleCategory: 'school',
      sentenceDifficulty: 'normal',
    });
    expect(search).not.toContain('customEnglish');
    expect(search).not.toContain('shuffleSeed');
  });

  it('round-trips sight-word settings and ignores invalid counts', () => {
    setupWorksheetControls();
    expect(parseUrlState('?practiceMode=sightWords&sightWordCount=8')).toEqual({
      practiceMode: 'sightWords',
      sightWordCount: 8,
    });
    expect(parseUrlState('?practiceMode=sightWords&sightWordCount=5')).toEqual({
      practiceMode: 'sightWords',
    });
  });
});
