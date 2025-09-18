/**
 * Type Definitions for English Note Maker
 * Production-grade type system with strict validation
 */

// ============= Core Data Types =============

/**
 * Age group classification for content difficulty
 */
export type AgeGroup = '4-6' | '7-9' | '10-12';

/**
 * Practice modes available in the application
 */
export type PracticeMode = 'normal' | 'sentence' | 'word' | 'alphabet' | 'phrase';

/**
 * Line height options for baseline grids (in mm)
 */
export type LineHeight = 8 | 10 | 12;

/**
 * Baseline color themes
 */
export type LineColor = 'gray' | 'blue' | 'green';

/**
 * Difficulty levels for educational content
 */
export type DifficultyLevel = 1 | 2 | 3;

/**
 * Content categories for examples
 */
export type ContentCategory =
  | 'daily'
  | 'school'
  | 'family'
  | 'hobby'
  | 'animals'
  | 'all';

/**
 * Word categories for vocabulary practice
 */
export type WordCategory =
  | 'animals'
  | 'food'
  | 'colors'
  | 'numbers'
  | 'calendar'
  | 'school_items'
  | 'body_parts'
  | 'weather';

/**
 * Phrase categories for conversation practice
 */
export type PhraseCategory =
  | 'greetings'
  | 'self_introduction'
  | 'school'
  | 'shopping'
  | 'travel'
  | 'feelings'
  | 'daily_life';

/**
 * Alphabet practice types
 */
export type AlphabetType = 'uppercase' | 'lowercase' | 'both';

// ============= Data Structure Interfaces =============

/**
 * Example sentence structure
 */
export interface ExampleSentence {
  english: string;
  japanese: string;
  category: ContentCategory;
  difficulty: DifficultyLevel;
  custom?: boolean;
  ageGroup?: AgeGroup;
}

/**
 * Word practice item
 */
export interface WordItem {
  english: string;
  japanese: string;
  syllables: string;
}

/**
 * Phrase practice item
 */
export interface PhraseItem {
  english: string;
  japanese: string;
  situation: string;
}

/**
 * Alphabet practice item
 */
export interface AlphabetItem {
  letter: string;
  example: string;
  japanese: string;
}

// ============= Configuration Interfaces =============

/**
 * Main application configuration
 */
export interface AppConfig {
  lineHeight: number;
  lineSpacing: number;
  pageMargin: PageMargin;
}

/**
 * Page margin configuration
 */
export interface PageMargin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Print layout configuration
 */
export interface PrintLayout {
  pageSize: {
    width: string;
    height: string;
  };
  margins: {
    standard: string;
    debug: string;
    minimum: string;
  };
  baseline: {
    lineHeight: Record<'small' | 'standard' | 'large', string>;
    spacing: string;
    groupMargin: string;
  };
}

/**
 * Color configuration
 */
export interface ColorConfig {
  baseline: {
    screen: string;
    print: string;
    blue: string;
    green: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  background: {
    page: string;
    content: string;
  };
}

// ============= UI State Interfaces =============

/**
 * Current UI state
 */
export interface UIState {
  practiceMode: PracticeMode;
  showExamples: boolean;
  showTranslation: boolean;
  showHeader: boolean;
  showSituation: boolean;
  showAlphabetExample: boolean;
  ageGroup: AgeGroup;
  lineHeight: LineHeight;
  lineColor: LineColor;
  pageCount: number;
  exampleCategory: ContentCategory;
  wordCategory: WordCategory;
  phraseCategory: PhraseCategory;
  alphabetType: AlphabetType;
}

/**
 * Form input values from UI controls
 */
export interface FormInputs {
  practiceMode: HTMLSelectElement | null;
  showExamples: HTMLInputElement | null;
  showTranslation: HTMLInputElement | null;
  showHeader: HTMLInputElement | null;
  ageGroup: HTMLSelectElement | null;
  lineHeight: HTMLSelectElement | null;
  lineColor: HTMLSelectElement | null;
  pageCount: HTMLInputElement | null;
  exampleCategory: HTMLSelectElement | null;
  wordCategory: HTMLSelectElement | null;
  phraseCategory: HTMLSelectElement | null;
  alphabetType: HTMLSelectElement | null;
  showAlphabetExample: HTMLInputElement | null;
  showSituation: HTMLInputElement | null;
}

// ============= Service Layer Interfaces =============

/**
 * Note generation options
 */
export interface NoteGenerationOptions {
  pageNumber: number;
  totalPages: number;
  state: UIState;
}

/**
 * Generated note page result
 */
export interface NotePageResult {
  html: string;
  metadata: {
    pageNumber: number;
    totalPages: number;
    timestamp: string;
    mode: PracticeMode;
  };
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  timestamp: string;
}

/**
 * Validation error details
 */
export interface ValidationError {
  rule: string;
  message: string;
  severity: 'error' | 'critical';
  actualValue?: string | number;
  expectedValue?: string | number;
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  rule: string;
  message: string;
  severity: 'warning' | 'info';
  suggestion?: string;
}

// ============= Error Handling Types =============

/**
 * Application error types
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  GENERATION = 'GENERATION',
  RENDERING = 'RENDERING',
  DATA_LOADING = 'DATA_LOADING',
  PRINT = 'PRINT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * Structured error information
 */
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string; // Japanese user-friendly message
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

// ============= Performance Monitoring Types =============

/**
 * Performance metric entry
 */
export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Performance report
 */
export interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    totalDuration: number;
    averageDuration: number;
    slowestOperation: string;
    fastestOperation: string;
  };
  timestamp: string;
}

// ============= Analytics Types =============

/**
 * Analytics event structure
 */
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

/**
 * User session information
 */
export interface UserSession {
  id: string;
  startTime: string;
  endTime?: string;
  events: AnalyticsEvent[];
  errors: AppError[];
}

// ============= Content Statistics =============

/**
 * Content statistics structure
 */
export interface ContentStats {
  lastUpdated: string;
  words: {
    total: number;
    byCategory: Record<WordCategory, number>;
    byAge: Record<AgeGroup, number>;
  };
  phrases: {
    total: number;
    byCategory: Record<PhraseCategory, number>;
    byAge: Record<AgeGroup, number>;
  };
  examples: {
    total: number;
    byAge: Record<AgeGroup, number>;
  };
}

// ============= Type Guards =============

/**
 * Type guard for AgeGroup
 */
export function isAgeGroup(value: unknown): value is AgeGroup {
  return typeof value === 'string' &&
    ['4-6', '7-9', '10-12'].includes(value);
}

/**
 * Type guard for PracticeMode
 */
export function isPracticeMode(value: unknown): value is PracticeMode {
  return typeof value === 'string' &&
    ['normal', 'sentence', 'word', 'alphabet', 'phrase'].includes(value);
}

/**
 * Type guard for validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return typeof error === 'object' &&
    error !== null &&
    'rule' in error &&
    'message' in error &&
    'severity' in error;
}

// ============= Utility Types =============

/**
 * Deep partial type for configuration updates
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Required fields type
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// ============= DOM Type Extensions =============

/**
 * Extended HTMLElement with dataset types
 */
export interface ExtendedHTMLElement extends HTMLElement {
  dataset: DOMStringMap & {
    mode?: PracticeMode;
    age?: AgeGroup;
    category?: string;
  };
}

/**
 * Print event detail
 */
export interface PrintEventDetail {
  pageCount: number;
  mode: PracticeMode;
  timestamp: string;
}