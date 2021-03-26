const enc = encodeURIComponent
const apiHost = 'api.sanity.io'
const cdnHost = 'apicdn.sanity.io'

function PicoSanity(config, fetcher) {
  if (!(this instanceof PicoSanity)) {
    return new PicoSanity(config)
  }

  this.clientConfig = config
  this.fetcher = fetcher
}

;[
  'clone',
  'create',
  'createIfNotExists',
  'createOrReplace',
  'delete',
  'listen',
  'mutate',
  'patch',
  'transaction',
].forEach((method) => {
  PicoSanity.prototype[method] = ni(method)
})

PicoSanity.prototype.config = function (cfg) {
  if (cfg) {
    this.clientConfig = Object.assign({}, this.clientConfig, cfg)
    return this
  }

  return this.clientConfig
}

PicoSanity.prototype.fetch = function (query, params) {
  const cfg = this.clientConfig
  const headers = cfg.token ? {Authorization: `Bearer ${cfg.token}`} : undefined
  const host = !cfg.useCdn || cfg.token ? apiHost : cdnHost
  const version = cfg.apiVersion ? `v${cfg.apiVersion.replace(/^v/, '')}` : 'v1'
  const opts = {credentials: cfg.withCredentials ? 'include' : 'omit', headers}
  const qs = getQs(query, params)
  return this.fetcher(
    `https://${cfg.projectId}.${host}/${version}/data/query/${cfg.dataset}${qs}`,
    opts
  ).then(parse)
}

function parse(res) {
  return res.json().then((json) => {
    if (res.status < 400) {
      return json.result
    }

    let msg = res.url
    let type = res.statusText
    if (json.error && json.error.description) {
      msg = json.error.description
      type = json.error.type || type
    }

    throw new Error(`HTTP ${res.status} ${type}: ${msg}`)
  })
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
