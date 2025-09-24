module.exports = {
  testEnvironment: "node",
  // transform: {
  //   "^.+.tsx?$": ["ts-jest", {}],
  // },
  testRegex: "/tests/.*\\.(test|spec)?\\.(js)$",
  // testMatch: [
  //   '**/tests/**/*.test.js',
  //   '**/tests/**/*.spec.js'
  // ],
  moduleFileExtensions: ["js", "json", "node"],
  testPathIgnorePatterns: ["/package", "/sdk", ""],
  testTimeout: 30000,
  setupFilesAfterEnv: ["./tests/setup.js"],
  collectCoverageFrom: [
    "routes/**/*.js",
    "models/**/*.js",
    "!**/node_modules/**",
  ],
};
