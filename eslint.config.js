import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.ts'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: { globals: globals.browser },
  },
  globalIgnores(['dist/']),
  tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
        },
      ],
    },
  },
]);
