module.exports = {
  rootDir: '..',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: { customExportConditions: ['require', 'default'] },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  testMatch: ['<rootDir>/src/tests/**/*.test.{js,jsx,ts,tsx}'],
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@/(utilities|models|hooks|api|providers)/(.*)$': '<rootDir>/src/$1/$2',
    '^@/common/(.*)$': '<rootDir>/src/components/common/$1',
    '\\.s?css$': '<rootDir>/src/tests/styleMock.ts',
    '^react/jsx(-dev)?-runtime$': 'preact/jsx-runtime',
    '^react-dom/test-utils$': 'preact/test-utils',
    '^react-dom/client$': 'preact/compat/client',
    '^react(-dom)?$': 'preact/compat',
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
