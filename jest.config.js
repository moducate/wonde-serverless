module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '/test/.*\\.test\\.ts$',
  collectCoverageFrom: ['src/**/*.ts'],
}
