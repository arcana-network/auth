const config = {
  verbose: true,
  testEnvironment: 'jsdom',
  automock: false,
  setupFiles: [],
  collectCoverage: true,
  preset: 'ts-jest',
  coverageReporters: ['text', 'cobertura'],
}

// eslint-disable-next-line no-undef
export default config
