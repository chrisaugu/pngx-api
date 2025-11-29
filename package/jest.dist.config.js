export default {
    displayName: 'Dist Tests',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/dist/**/*.test.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    rootDir: process.cwd(),

    // If you need to transform ES modules
    transformIgnorePatterns: [],

    // For ES module support
    // extensionsToTreatAsEsm: ['.js'],
    globals: {
        'ts-jest': {
            useESM: true
        }
    },
    // moduleNameMapping: {
    //     '^(\\.{1,2}/.*)\\.js$': '$1'
    // }
};