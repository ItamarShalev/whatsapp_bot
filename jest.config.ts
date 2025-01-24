import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest/presets/default-esm', // Use ts-jest to handle TypeScript files
    testEnvironment: 'node', // Use Node.js as the test environment
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: './tsconfig.json',
                useESM: true,
            },
        ], // Transform TypeScript files using ts-jest with config
    },
    moduleDirectories: ['node_modules', 'src'], // Allow absolute imports from 'src'
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$', // Match test files
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // Recognize these file extensions
    testPathIgnorePatterns: ['/node_modules/', '/dist/'], // Ignore the dist folder
    verbose: true, // Be verbose
};

export default config;
