import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  collectCoverage: false,
  coverageDirectory: 'coverage',
  globalSetup: './test_utils/jest.setup.ts',
  globalTeardown: './test_utils/jest.teardown.ts',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // coveragePathIgnorePatterns: ['']
};

export default config;
