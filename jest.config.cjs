module.exports = {
  projects: [
    {
      displayName: 'Backend Tests',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
      testMatch: [
        '<rootDir>/tests/**/*.(test|spec).(ts|js)',
        '!<rootDir>/tests/frontend/**/*'
      ],
      transform: {
        '^.+\\.(ts)$': 'ts-jest'
      },
      moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/shared/$1'
      },
      collectCoverageFrom: [
        'server/**/*.{ts,js}',
        '!**/*.d.ts',
        '!**/node_modules/**'
      ]
    },
    {
      displayName: 'Frontend Tests',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.ts'],
      testMatch: [
        '<rootDir>/tests/frontend/**/*.(test|spec).(ts|tsx|js)',
        '<rootDir>/client/src/**/*.(test|spec).(ts|tsx|js)'
      ],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest'
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/src/$1',
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '^@assets/(.*)$': '<rootDir>/attached_assets/$1'
      },
      transformIgnorePatterns: [
        'node_modules/(?!(wouter|@testing-library)/)'
      ],
      collectCoverageFrom: [
        'client/src/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**'
      ]
    }
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};