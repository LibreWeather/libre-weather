module.exports = {
  rootDir: '..',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  testMatch: ['<rootDir>/src/tests/**/*.test.{js,jsx,ts,tsx}'],
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@/utilities$': '<rootDir>/src/utilities',
    '^@/utilities/(.*)$': '<rootDir>/src/utilities/$1',
    '^@/common/(.*)$': '<rootDir>/src/components/common/$1',
    '\\.(less|css)$': '<rootDir>/src/tests/styleMock.ts',
  },
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
      },
    ],
  },
};
