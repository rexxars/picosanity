const Client = require('./client')

module.exports = function(cfg) {
  return new Client(cfg, window.fetch)
}
