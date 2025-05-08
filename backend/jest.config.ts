import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/test/app.e2e-spec.ts', '<rootDir>/coverage/', '<rootDir>/jest.config.ts', '<rootDir>/src/main.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/test/app.e2e-spec.ts', '<rootDir>/coverage/', '<rootDir>/jest.config.ts', '<rootDir>/src/main.ts'],
  rootDir: './',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  coverageReporters: ['lcov', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};