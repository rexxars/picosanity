const Client = require('./client')

module.exports = function (cfg) {
  return new Client(cfg, (input, init) => fetch(input, init))
}
