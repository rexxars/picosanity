const fetch = require('cross-fetch')

const enc = encodeURIComponent
const apiHost = 'api.sanity.io'
const cdnHost = 'apicdn.sanity.io'

function PicoSanity(config) {
  if (!(this instanceof PicoSanity)) {
    return new PicoSanity(config)
  }

  this.cfg = config
}

;[
  'clone',
  'config',
  'create',
  'createIfNotExists',
  'createOrReplace',
  'delete',
  'listen',
  'mutate',
  'patch',
  'transaction'
].forEach(method => {
  PicoSanity.prototype[method] = ni(method)
})

PicoSanity.prototype.fetch = function(query, params) {
  const cfg = this.cfg
  const host = cfg.useCdn ? cdnHost : apiHost
  const qs = getQs(query, params)
  return fetch(`https://${cfg.projectId}.${host}/v1/data/query/${cfg.dataset}${qs}`)
    .then(res => res.json())
    .then(res => res.result)
}

function getQs(query, params) {
  const baseQs = `?query=${enc(query)}`
  return Object.keys(params || {}).reduce((current, param) => {
    return `${current}&${enc(`$${param}`)}=${enc(JSON.stringify(params[param]))}`
  }, baseQs)
}

function ni(method) {
  return () => {
    throw new Error(`Method "${method}" not implemented, use @sanity/client`)
  }
}

module.exports = PicoSanity
