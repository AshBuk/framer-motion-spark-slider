// @ts-check
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import nextConfig from 'eslint-config-next';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '*.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      'packages/*/dist/**',
      '*.d.ts',
    ],
  },
  // Next.js recommended rules (native flat config in v16)
  ...nextConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Disable base rule in favor of @typescript-eslint version
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'never' },
      ],
      // Allow setState in effects for initialization (DOM measurements, sessionStorage)
      'react-hooks/set-state-in-effect': 'off',
      'no-console': 'warn',
      'prefer-const': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'arrow-body-style': ['warn', 'as-needed'],
    },
  },
  // Test files configuration
  {
    files: [
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      'tests/**/*.{ts,tsx,js,jsx}',
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@next/next/no-img-element': 'off',
      'jsx-a11y/alt-text': 'off',
    },
  },
  // Disable formatting-related rules to avoid conflicts with Prettier
  prettier,
];

export default config;
