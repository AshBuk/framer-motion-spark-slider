const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@ashbuk/spark-slider$': '<rootDir>/packages/spark-slider/src/index.ts',
  },
  testMatch: [
    '<rootDir>/tests/unit/**/*.(test|spec).(js|jsx|ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'packages/spark-slider/src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/page.tsx',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/packages/*/dist/',
    '<rootDir>/dist/',
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/packages/*/dist/',
    '<rootDir>/dist/',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/packages/*/dist/'],
  haste: {
    forceNodeFilesystemAPI: true,
  },
  verbose: false,
  silent: false,
};

module.exports = createJestConfig(customJestConfig);
