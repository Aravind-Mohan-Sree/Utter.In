import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  // 0. Global ignores – this applies to the whole project
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**'],
  },

  // 1. Base ESLint Recommended Rules (Plain JavaScript Rules)
  eslint.configs.recommended,

  // 2. TypeScript Recommended Rules
  ...tseslint.configs.recommended,

  // 3. TypeScript Stylistic Rules
  ...tseslint.configs.stylistic,

  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },

    rules: {
      semi: ['error', 'always'],
      indent: ['error', 2],
      'comma-dangle': ['error', 'always-multiline'],
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'off',
      'no-unused-vars': 'off',

      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
    },
  },
];
