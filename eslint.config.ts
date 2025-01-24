import eslintPluginPrettier from 'eslint-plugin-prettier';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
    baseDirectory: process.cwd(),
    recommendedConfig: { parserOptions: { ecmaVersion: 2021 } },
});

export default [
    {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module',
            },
            globals: {
                process: 'readonly',
                module: 'readonly',
                require: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslintPlugin,
            prettier: eslintPluginPrettier,
        },
        rules: {
            'prettier/prettier': 'error',
            'no-unused-vars': 'error',
            'no-console': 'error',
            indent: ['error', 4, { MemberExpression: 0 }],
            'max-len': ['error', { code: 100, ignoreUrls: true }],
            'newline-per-chained-call': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': ['error', {}],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-extraneous-class': ['error', { allowStaticOnly: true }],
        },
    },
    // Include legacy `extends` configurations via FlatCompat
    ...compat.config({
        extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended',
            'plugin:@typescript-eslint/strict',
            'plugin:prettier/recommended',
        ],
    }),
];
