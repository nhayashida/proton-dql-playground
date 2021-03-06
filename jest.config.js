module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/client/playground/index.tsx',
    '!src/common/models/**/*.ts',
    '!src/common/types/**/*.ts',
    '!src/common/utils/**/*.ts',
    '!src/server/boot/root.ts',
    '!src/server/controllers/index.ts',
    '!src/server/*.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
};
