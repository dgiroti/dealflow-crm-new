import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default defineConfig([
  // Never check generated or downloaded files
  globalIgnores(['**/dist/', '**/node_modules/', '**/coverage/', '**/dist-lambda/']),

  // JavaScript's recommended rules (e.g. catches unused variables, unreachable code)
  js.configs.recommended,

  // TypeScript's recommended rules (e.g. warns about using "any")
  tseslint.configs.recommended,

  // Our code runs in both Node.js (API) and the browser (web app)
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // React rules, only for the web app
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      // Hooks (useQuery, useState...) must be called the same way on every render
      'react-hooks/rules-of-hooks': 'error',
      // Warns when an effect is missing something it depends on
      'react-hooks/exhaustive-deps': 'warn',
      // Keeps instant reloading working while you edit components
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
]);
