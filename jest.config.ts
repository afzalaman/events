import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    'query-string': '<rootDir>/__mocks__/query-string.js'
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};

export default createJestConfig(config);