/**
 * Vitest Configuration for English Note Maker
 * Production-grade testing setup with TypeScript support
 */

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',

    // Global test configuration
    globals: true,

    // Setup files
    setupFiles: ['./test/setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',

      // Coverage thresholds - production grade requirements
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Stricter requirements for critical modules
        './src/services/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        './src/utils/ErrorHandler.ts': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        }
      },

      // Include/exclude patterns
      include: [
        'src/**/*.{ts,js}',
        '!src/**/*.d.ts',
        '!src/types/**/*'
      ],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        'build/',
        '**/*.config.{ts,js}',
        '**/*.test.{ts,js}',
        '**/*.spec.{ts,js}'
      ],

      // Report uncovered files
      all: true,

      // Skip coverage for certain patterns
      skipFull: false
    },

    // Test file patterns
    include: [
      'test/**/*.{test,spec}.{ts,js}',
      'src/**/*.{test,spec}.{ts,js}'
    ],

    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },

    // Reporter configuration
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/index.html'
    },

    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,

    // Watch mode
    watch: false,

    // Retry failed tests
    retry: 1
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/data': resolve(__dirname, 'src/data'),
      '@/models': resolve(__dirname, 'src/models')
    }
  },

  // Build configuration for testing
  define: {
    __TEST__: true,
    __DEV__: true
  },

  // Esbuild options
  esbuild: {
    target: 'es2022'
  }
});