module.exports = {
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    },
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'json'
    ],
    testEnvironment: './jest-custom-environment',
    coverageDirectory: 'coverage',
    coverageReporters: [ /* 'lcov', */ 'html', 'text' /* 'json', 'clover' */ ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
