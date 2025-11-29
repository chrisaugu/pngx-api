/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  // transform: {'^.+\\.ts?$': 'ts-jest'},
  testRegex: "/tests/.*\\.(test|spec)?\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  rootDir: './tests',
  verbose: true,
  clearMocks: true,

  // Target test files in dist directory
  testMatch: [
    '<rootDir>/dist/**/__tests__/**/*.js',
    '<rootDir>/dist/**/?(*.)+(spec|test).js'
  ],

  // Ignore source test files to prevent double testing
  testPathIgnorePatterns: [
    '<rootDir>/src/',
    '<rootDir>/node_modules/'
  ],

  // If you need module mapping for imports
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/dist/$1'
  },

  // Set root directory to dist for module resolution
  rootDir: './dist',

  // If you have ES modules in dist
  transform: {}
};
