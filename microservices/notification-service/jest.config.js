module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.interface.ts',
    '!src/main.ts',
  ],
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
    }],
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};

