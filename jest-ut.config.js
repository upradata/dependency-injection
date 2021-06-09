// /(?!(something)/) means will not match something
// eslint-disable-next-line global-require
module.exports = { ...require('./jest-common.config'), testRegex: `${process.cwd()}/(?!(e2e|examples)/).+\\.spec\\.ts`, };
