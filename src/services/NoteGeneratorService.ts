/**
 * Note Generator Service - Production-grade refactored architecture
 * Handles all note generation logic with proper error handling and validation
 */

import type {
  UIState,
  ExampleSentence,
  WordData,
  AlphabetData,
  PhraseData,
  LineHeight,
  ValidationResult,
} from '../types/index.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { ValidationService } from './ValidationService.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { getDataManager, CATEGORY_DISPLAY_NAMES } from '../data/index.js';
import type {
  AgeGroup,
  SentenceContentItem,
  WordContentItem,
  AlphabetContentItem,
  PhraseContentItem,
} from '../data/index.js';

export class NoteGeneratorService {
  private readonly errorHandler: ErrorHandler;
  private readonly validator: ValidationService;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly cache = new Map<string, string>();

  constructor() {
    this.errorHandler = new ErrorHandler('NoteGeneratorService');
    this.validator = new ValidationService();
    this.performanceMonitor = new PerformanceMonitor();
  }

  /**
   * Generate complete note HTML with proper error handling and validation
   */
  public async generateNote(state: UIState): Promise<{
    html: string;
    validation: ValidationResult[];
    performance: Record<string, number>;
  }> {
    const performanceId = this.performanceMonitor.startTiming('generateNote');

    try {
      // Input validation
      await this.validateUIState(state);

      // ランダムコンテンツを含むモードはキャッシュをスキップ
      const randomModes = ['sentence', 'word', 'phrase'];
      const useCache = !randomModes.includes(state.practiceMode);

      // Check cache first (non-random modes only)
      const cacheKey = this.generateCacheKey(state);
      if (useCache) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          this.performanceMonitor.endTiming(performanceId);
          return {
            html: cached,
            validation: [],
            performance: this.performanceMonitor.getMetrics(),
          };
        }
      }

      // Generate pages
      let html = '';
      for (let page = 1; page <= state.pageCount; page++) {
        if (page > 1) {
          html += this.generatePageBreak(page);
        }
        html += await this.generateSinglePage(state, page);
      }

      // Validate generated HTML
      const validation = await this.validator.validateGeneratedHTML(html);

      // Cache result if valid (non-random modes only)
      if (useCache && validation.every((v) => v.severity !== 'error')) {
        this.cache.set(cacheKey, html);
      }

      this.performanceMonitor.endTiming(performanceId);

      return {
        html,
        validation,
        performance: this.performanceMonitor.getMetrics(),
      };
    } catch (error) {
      this.performanceMonitor.endTiming(performanceId);
      throw this.errorHandler.handleError(error, {
        method: 'generateNote',
        state: this.sanitizeStateForLogging(state),
      });
    }
  }

  /**
   * Generate a single page with proper error boundaries
   */
  private async generateSinglePage(state: UIState, pageNumber: number): Promise<string> {
    try {
      const styleVars = this.generateStyleVariables(state);
      const colorClass = state.lineColor !== 'gray' ? `line-color-${state.lineColor}` : '';

      let html = `<div class="note-page ${colorClass}" ${styleVars}>`;

      // Header section
      if (state.showHeader) {
        html += this.generateHeader();
      }

      // Content based on practice mode
      switch (state.practiceMode) {
        case 'sentence':
          html += await this.generateSentencePractice(state);
          break;
        case 'word':
          html += await this.generateWordPractice(state);
          break;
        case 'alphabet':
          html += await this.generateAlphabetPractice(state, pageNumber);
          break;
        case 'phrase':
          html += await this.generatePhrasePractice(state);
          break;
        case 'normal':
        default:
          html += await this.generateNormalPractice(state);
          break;
      }

      html += '</div>';
      return html;
    } catch (error) {
      throw this.errorHandler.handleError(error, {
        method: 'generateSinglePage',
        pageNumber,
        practiceMode: state.practiceMode,
      });
    }
  }

  /**
   * Generate CSS style variables for consistent layout
   */
  private generateStyleVariables(state: UIState): string {
    const lineHeight = state.lineHeight;
    const lineSpacing = Math.max(1, Math.floor(lineHeight * 0.2));
    const lineSeparatorHeight = Math.max(2, Math.floor(lineHeight * 0.4));
    const sentenceGroupMargin = Math.max(8, lineHeight);

    return `style="
      --line-height-mm: ${lineHeight}mm;
      --line-spacing-mm: ${lineSpacing}mm;
      --line-separator-height: ${lineSeparatorHeight}mm;
      --sentence-group-margin: ${sentenceGroupMargin}mm;
    "`;
  }

  /**
   * Generate header section with name and date fields
   */
  private generateHeader(): string {
    return `
      <div class="note-header">
        <div class="note-header__item">
          <span class="note-header__label">名前:</span>
          <input class="note-header__input" type="text" readonly>
        </div>
        <div class="note-header__item">
          <span class="note-header__label">日付:</span>
          <input class="note-header__input" type="text" readonly>
        </div>
      </div>
    `;
  }

  /**
   * Generate baseline group for handwriting practice
   */
  private generateBaselineGroup(): string {
    return `
      <div class="baseline-group">
        <div class="baseline baseline--top"></div>
        <div class="baseline baseline--upper"></div>
        <div class="baseline baseline--lower"></div>
        <div class="baseline baseline--bottom"></div>
      </div>
    `;
  }

  /**
   * Generate example sentence with optional translation
   */
  private generateExampleSentence(sentence: ExampleSentence, showTranslation: boolean): string {
    const difficultyStars = '★'.repeat(sentence.difficulty);

    return `
      <div class="example-sentence">
        <div class="example-english">
          ${this.escapeHtml(sentence.english)}
          <span class="difficulty-indicator">${difficultyStars}</span>
        </div>
        ${showTranslation ? `<div class="example-japanese">${this.escapeHtml(sentence.japanese)}</div>` : ''}
      </div>
    `;
  }

  /**
   * Generate normal practice mode content
   */
  private async generateNormalPractice(state: UIState): Promise<string> {
    const lineHeight = state.lineHeight;
    const baseMaxLines = state.showExamples ? 12 : 14;
    const maxLines = this.calculateMaxLines(baseMaxLines, lineHeight);

    let html = '';

    // Generate examples if needed
    let examples: ExampleSentence[] = [];
    if (state.showExamples && state.selectedCategories?.sentence) {
      const neededExamples = Math.floor(maxLines / 4);
      examples = await this.getExamplesForAge(
        state.ageGroup,
        neededExamples,
        state.selectedCategories.sentence
      );
    }

    for (let i = 0; i < maxLines; i++) {
      const exampleIndex = Math.floor(i / 4);
      const example = examples[exampleIndex];
      const shouldShowExample = state.showExamples && example && i % 4 === 0;

      if (shouldShowExample && example) {
        html += this.generateExampleSentence(example, state.showTranslation);
      }

      html += this.generateBaselineGroup();

      if (i !== maxLines - 1) {
        html += '<div class="line-separator-small"></div>';
      }
    }

    return html;
  }

  /**
   * Generate sentence practice mode content
   */
  private async generateSentencePractice(state: UIState): Promise<string> {
    const lineHeight = state.lineHeight;
    const baseMaxExamples = state.showTranslation ? 4 : 5;
    const maxExamples = this.calculateMaxLines(baseMaxExamples, lineHeight);

    const examples = await this.getExamplesForAge(
      state.ageGroup,
      maxExamples,
      state.selectedCategories?.sentence || 'daily'
    );

    let html = '';
    for (const example of examples) {
      html += `
        <div class="sentence-practice-group">
          ${this.generateExampleSentence(example, state.showTranslation)}
          <div class="practice-lines">
            ${this.generateBaselineGroup()}
            <div class="line-separator"></div>
            ${this.generateBaselineGroup()}
          </div>
        </div>
      `;
    }

    return html;
  }

  /**
   * Generate word practice mode content
   */
  private async generateWordPractice(state: UIState): Promise<string> {
    const words = await this.getWordsForCategory(
      state.selectedCategories?.word || 'animals',
      state.ageGroup
    );
    const lineHeight = state.lineHeight;
    const maxWords = lineHeight === 12 ? 3 : lineHeight === 8 ? 5 : 4;
    const displayWords = words.slice(0, maxWords);

    const categoryNames = this.getWordCategoryNames();
    const wordCategory = state.selectedCategories?.word || 'animals';

    let html = `<div class="word-practice">`;
    html += `<h3 class="practice-title">Word Practice - ${categoryNames[wordCategory] || wordCategory}</h3>`;

    for (const word of displayWords) {
      const itemMargin = lineHeight === 12 ? '18mm' : lineHeight === 8 ? '10mm' : '12mm';
      html += `
        <div class="word-practice-item" style="margin-bottom: ${itemMargin};">
          <div class="word-header">
            <span class="word-english">${this.escapeHtml(word.english)}</span>
            <span class="word-syllables">${this.escapeHtml(word.syllables)}</span>
            <span class="word-japanese">${this.escapeHtml(word.japanese)}</span>
          </div>
          ${this.generateBaselineGroup()}
          <div class="line-separator-small"></div>
          ${this.generateBaselineGroup()}
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  /**
   * Generate alphabet practice mode content
   */
  private async generateAlphabetPractice(state: UIState, pageNumber: number): Promise<string> {
    const alphabetData = await this.getAlphabetData(state.alphabetType);
    const lettersPerPage = 6;
    const startIndex = (pageNumber - 1) * lettersPerPage;
    const currentPageLetters = alphabetData.slice(startIndex, startIndex + lettersPerPage);

    if (currentPageLetters.length === 0) {
      return '<div class="alphabet-practice"><p class="no-content">このページには表示する文字がありません</p></div>';
    }

    const totalPages = Math.ceil(alphabetData.length / lettersPerPage);

    let html = '<div class="alphabet-practice">';
    html += `<h3 class="practice-title">Alphabet Practice ${totalPages > 1 ? `(${pageNumber}/${totalPages})` : ''}</h3>`;
    html += '<div class="alphabet-grid">';

    for (const item of currentPageLetters) {
      html += `
        <div class="alphabet-grid-item">
          <div class="alphabet-header">
            <span class="alphabet-letter">${this.escapeHtml(item.letter)}</span>
            ${
              state.showAlphabetExample
                ? `
              <div class="alphabet-example">
                <span class="example-word">${this.escapeHtml(item.example)}</span>
                <span class="example-meaning">(${this.escapeHtml(item.japanese)})</span>
              </div>
            `
                : ''
            }
          </div>
          <div class="alphabet-lines">
            ${this.generateBaselineGroup()}
          </div>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  }

  /**
   * Generate phrase practice mode content
   */
  private async generatePhrasePractice(state: UIState): Promise<string> {
    const phraseCategory = state.selectedCategories?.phrase || 'greetings';
    const phrases = await this.getPhrasesForCategory(phraseCategory, state.ageGroup);
    const shuffledPhrases = this.shuffleArray([...phrases]).slice(0, 4);

    const categoryNames = this.getPhraseCategoryNames();

    let html = '<div class="phrase-practice">';
    html += `<h3 class="practice-title">Phrase Practice - ${categoryNames[phraseCategory] || phraseCategory}</h3>`;

    for (const phrase of shuffledPhrases) {
      html += `
        <div class="phrase-item">
          <div class="phrase-header">
            <div class="phrase-main">
              <div class="phrase-english">${this.escapeHtml(phrase.english)}</div>
              ${state.showTranslation ? `<div class="phrase-japanese">${this.escapeHtml(phrase.japanese)}</div>` : ''}
            </div>
            ${state.showSituation ? `<div class="phrase-situation">【${this.escapeHtml(phrase.situation)}】</div>` : ''}
          </div>
          <div class="phrase-lines">
            ${this.generateBaselineGroup()}
            <div class="line-separator-small"></div>
            ${this.generateBaselineGroup()}
            <div class="line-separator-small"></div>
            ${this.generateBaselineGroup()}
          </div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  /**
   * Generate page break with proper styling
   */
  private generatePageBreak(pageNumber: number): string {
    return `
      <div class="page-separator">
        <div class="page-separator-line"></div>
        <div class="page-separator-text">ページ ${pageNumber}</div>
        <div class="page-separator-line"></div>
      </div>
      <div style="page-break-before: always;"></div>
    `;
  }

  /**
   * Utility methods
   */
  private calculateMaxLines(baseLines: number, lineHeight: LineHeight): number {
    return lineHeight === 12
      ? Math.floor(baseLines * 0.8)
      : lineHeight === 8
        ? Math.floor(baseLines * 1.2)
        : baseLines;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateCacheKey(state: UIState): string {
    return `note_${JSON.stringify(state)}`;
  }

  private sanitizeStateForLogging(state: UIState): Partial<UIState> {
    return {
      practiceMode: state.practiceMode,
      ageGroup: state.ageGroup,
      pageCount: state.pageCount,
      lineHeight: state.lineHeight,
    };
  }

  private async validateUIState(state: UIState): Promise<void> {
    if (!state.practiceMode) {
      throw new Error('Practice mode is required');
    }
    if (state.pageCount < 1 || state.pageCount > 10) {
      throw new Error('Page count must be between 1 and 10');
    }
    if (![8, 10, 12].includes(state.lineHeight)) {
      throw new Error('Invalid line height');
    }
  }

  // Data access methods using DataManager
  private async getExamplesForAge(
    ageGroup: string,
    count: number,
    category: string
  ): Promise<ExampleSentence[]> {
    const manager = getDataManager();

    const sentences = await manager.getSentences({
      ageGroup: ageGroup as AgeGroup,
      category: category === 'all' ? undefined : category,
      limit: count,
      shuffle: true,
    });

    return sentences.map((item: SentenceContentItem) => ({
      english: item.english,
      japanese: item.japanese,
      category: item.category as ExampleSentence['category'],
      difficulty: item.difficulty,
      custom: item.custom,
      ageGroup: item.ageGroup,
    }));
  }

  private async getWordsForCategory(category: string, ageGroup: string): Promise<WordData[]> {
    const manager = getDataManager();

    const words = await manager.getWords({
      category,
      ageGroup: ageGroup as AgeGroup,
      shuffle: true,
    });

    return words.map((item: WordContentItem) => ({
      word: item.english,
      english: item.english,
      japanese: item.japanese,
      syllables: item.syllables,
      category: item.category as WordData['category'],
      ageGroup: item.ageGroup,
    }));
  }

  private async getAlphabetData(type: string): Promise<AlphabetData[]> {
    const manager = getDataManager();

    // 'both'の場合は両方、それ以外は指定されたタイプ
    let alphabet: AlphabetContentItem[] = [];

    if (type === 'both') {
      alphabet = await manager.getAlphabet();
    } else {
      alphabet = await manager.getAlphabet({
        category: type,
      });
    }

    return alphabet.map((item: AlphabetContentItem) => ({
      letter: item.letter,
      example: item.example,
      japanese: item.japanese,
      type: item.letterCase as AlphabetData['type'],
    }));
  }

  private async getPhrasesForCategory(category: string, ageGroup: string): Promise<PhraseData[]> {
    const manager = getDataManager();

    const phrases = await manager.getPhrases({
      category,
      ageGroup: ageGroup as AgeGroup,
    });

    return phrases.map((item: PhraseContentItem) => ({
      phrase: item.english,
      english: item.english,
      japanese: item.japanese,
      situation: item.situation,
      category: item.category as PhraseData['category'],
      ageGroup: item.ageGroup,
    }));
  }

  private getWordCategoryNames(): Record<string, string> {
    return CATEGORY_DISPLAY_NAMES;
  }

  private getPhraseCategoryNames(): Record<string, string> {
    return CATEGORY_DISPLAY_NAMES;
  }
}
