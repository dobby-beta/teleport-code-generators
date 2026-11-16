const base = require('./jest.config.js')
module.exports = {
  ...base,
  moduleNameMapper: {
    ...base.moduleNameMapper,
    '^@teleporthq/(teleport-[a-z-]+)$': '<rootDir>/packages/$1/src',
  },
}
