/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  extensionsToTreatAsEsm: ['.ts'],

  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: './tsconfig.json'
    }
  },

  testMatch: [
    '<rootDir>/server/__tests__/**/*.test.ts',
    '<rootDir>/shared/__tests__/**/*.test.ts',
    '<rootDir>/__tests__/**/*.test.ts'
  ],

  moduleNameMapper: {
    // 🔁 Path aliases
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@/(.*)$': '<rootDir>/client/src/$1',

    // 🧼 Fix for .js extensions in ESM-style imports in TS code
    '^(\\.{1,2}/.*)\\.js$': '$1.ts'
  }
};
