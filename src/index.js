const fetch = require('node-fetch')
const Client = require('./client')
const pkg = require('../package.json')

module.exports = function (cfg) {
  return new Client(cfg, {
    headers: {'User-Agent': `${pkg.name}@${pkg.version}`},
    fetch,
  })
}
