module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@school-mgmt/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  testMatch: ['**/*.test.ts'],
};
