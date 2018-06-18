const fetch = require('node-fetch')
const Client = require('./client')

module.exports = cfg => new Client(cfg, fetch)
