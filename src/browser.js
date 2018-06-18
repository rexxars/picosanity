const Client = require('./client')

module.exports = cfg => new Client(cfg, window.fetch)
