export default {
    testEnvironment: 'node',
    verbose: true,
    clearMocks: true,
    testMatch: ['**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.tsx?$': ['@swc/jest'],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};