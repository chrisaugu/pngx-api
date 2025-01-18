module.exports = {
  testEnvironment: "node",
  // transform: {
  //   "^.+.tsx?$": ["ts-jest", {}],
  // },
  testRegex: "/tests/.*\\.(test|spec)?\\.(js)$",
  moduleFileExtensions: ["js", "json", "node"],
  testPathIgnorePatterns: ["/package", "/nuku-redis-worker"],
};
