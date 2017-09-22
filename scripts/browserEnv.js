let browserEnvLocal
const version = require('../package.json').version

try {
  browserEnvLocal = require('./browserEnv.local')
} catch (error) {
  console.log('The service need browserEnv local file,')
  console.log('you can run scripts to resolve this problem:\n')
  console.log('cp ./scripts/browserEnv.example.js ./scripts/browserEnv.local.js\n\n')
  process.exit(1)
}

module.exports = {
  DEBUG: 'true',
  APP_NAME: '"Example Vue App"',
  VERSION: JSON.stringify(version),
  ...browserEnvLocal
}
