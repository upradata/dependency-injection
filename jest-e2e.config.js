// eslint-disable-next-line global-require
module.exports = { ...require('./jest-common.config'), testRegex: `${process.cwd()}/e2e/.+\\.spec\\.ts` };
