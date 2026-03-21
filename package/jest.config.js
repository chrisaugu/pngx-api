/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    "^.+.ts?$": ["ts-jest", {}],
  },
  testRegex: "/tests/.*\\.(test|spec)?\\.(ts)$",
  moduleFileExtensions: ['ts', 'js'],
  transformIgnorePatterns: [
    'node_modules/(?!(your-module)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  clearMocks: true,
  coverageDirectory: 'coverage'
};
