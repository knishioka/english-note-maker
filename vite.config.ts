import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',

  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.promise',
        'es.array',
        'es.object',
        'es.string',
        'es.symbol',
        'es.map',
        'es.set',
      ],
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@/services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@/models': fileURLToPath(new URL('./src/models', import.meta.url)),
      '@/data': fileURLToPath(new URL('./src/data', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@/config': fileURLToPath(new URL('./src/config', import.meta.url)),
    },
  },

  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
        ascii_only: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['puppeteer'],
          data: [
            './src/data/example-sentences.js',
            './src/data/word-lists.js',
            './src/data/alphabet-data.js',
            './src/data/phrase-data.js',
          ],
          services: [
            './src/services/note-generator.ts',
            './src/services/validation.ts',
            './src/services/error-handler.ts',
          ],
          utils: [
            './src/utils/dom-helpers.ts',
            './src/utils/performance-monitor.ts',
            './src/utils/analytics.ts',
          ],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop() || '';
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/css/i.test(extType)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
      input: {
        main: './index.html',
      },
    },
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
  },

  server: {
    port: 3000,
    host: 'localhost',
    open: false,
    cors: true,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: true,
    },
  },

  preview: {
    port: 4173,
    host: 'localhost',
    open: false,
    cors: true,
  },

  optimizeDeps: {
    include: ['puppeteer'],
    exclude: [],
    esbuildOptions: {
      target: 'es2022',
    },
  },

  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
    postcss: {
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: (atRule) => {
              if (atRule.name === 'charset') {
                atRule.remove();
              }
            },
          },
        },
      ],
    },
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env['NODE_ENV']),
    __APP_VERSION__: JSON.stringify(process.env['npm_package_version']),
  },

  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    legalComments: 'none',
    charset: 'utf8',
  },
});