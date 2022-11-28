const config = {
  verbose: true,
  testEnvironment: 'jsdom',
  automock: false,
  setupFiles: [],
  collectCoverage: true,
  preset: 'ts-jest',
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!preact)'],
  coverageReporters: ['text', 'cobertura'],
}

// eslint-disable-next-line no-undef
export default config
