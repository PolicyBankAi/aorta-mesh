/** @type {import('jest').Config} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",

  // ✅ Treat .ts files as ESM
  extensionsToTreatAsEsm: [".ts"],

  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.json"
      }
    ]
  },

  testMatch: [
    "<rootDir>/server/__tests__/**/*.test.ts",
    "<rootDir>/shared/__tests__/**/*.test.ts",
    "<rootDir>/__tests__/**/*.test.ts"
  ],

  moduleNameMapper: {
    // 🔁 Path aliases
    "^@shared/(.*)$": "<rootDir>/shared/$1",
    "^@/(.*)$": "<rootDir>/client/src/$1",

    // 🧼 Fix for .js extensions in ESM-style imports in TS code
    "^(\\.{1,2}/.*)\\.js$": "$1.ts"
  },

  // ✅ Safer defaults
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // ✅ Coverage setup
  collectCoverage: true,
  collectCoverageFrom: [
    "server/**/*.ts",
    "shared/**/*.ts",
    "!**/__tests__/**",
    "!**/node_modules/**"
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8"
};
