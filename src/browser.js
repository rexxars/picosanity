const Client = require('./client')

module.exports = function (cfg) {
  const fetcher = (input, init) => fetch(input, init)
  return new Client(cfg, {fetch: fetcher})
}
