import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { importX } from 'eslint-plugin-import-x';
import jsonc from 'eslint-plugin-jsonc';
import yml from 'eslint-plugin-yml';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const stylisticConfig = stylistic.configs.customize({
  indent: 2,
  quotes: 'single',
  semi: true,
  jsx: true,
  arrowParens: true,
  braceStyle: '1tbs',
  quoteProps: 'as-needed',
  commaDangle: 'always-multiline',
  blockSpacing: true,
  bracketSpacing: true,
});

export default [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      '.parcel-cache/**',
      'package-lock.json',
      'CHANGELOG.md',
      'src/assets/packages.json',
    ],
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@stylistic': stylistic,
      'import-x': importX,
      'react-hooks': reactHooks,
    },
    settings: {
      'import-x/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.json'],
        },
      },
    },
    rules: {
      ...stylisticConfig.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@stylistic/max-len': [
        'error',
        { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true, ignoreComments: true },
      ],
      '@stylistic/jsx-closing-bracket-location': ['error', 'after-props'],
      '@stylistic/jsx-one-expression-per-line': 'off',
      '@stylistic/multiline-ternary': 'off',
      '@stylistic/operator-linebreak': ['error', 'after'],
      '@stylistic/comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
        },
      ],
      'no-underscore-dangle': 'off',
      strict: ['error', 'safe'],
      'no-restricted-syntax': 'off',
      'no-await-in-loop': 'off',
      'no-fallthrough': 'off',
      'no-param-reassign': 'off',
      'no-case-declarations': 'off',
      'no-nested-ternary': 'off',
      'no-continue': 'off',
      'class-methods-use-this': 'off',
      'max-classes-per-file': 'off',
      'default-case': 'off',
      'import-x/prefer-default-export': 'off',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
    },
  },
  {
    files: ['**/*.mjs', '.config/**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
    },
  },
  {
    files: ['src/tests/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    files: ['cypress/**/*.{js,jsx}', 'cypress.config.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.mocha,
        ...globals.cypress,
      },
    },
  },
  ...jsonc.configs['flat/recommended-with-json'],
  ...yml.configs['flat/recommended'],
  {
    files: ['**/*.{yml,yaml}'],
    rules: {
      'yml/indent': 'error',
      'yml/quotes': ['error', { prefer: 'single' }],
      'yml/plain-scalar': 'error',
      'yml/key-spacing': 'error',
      'yml/spaced-comment': 'error',
    },
  },
];
