import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

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
]);
