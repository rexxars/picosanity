const enc = encodeURIComponent
const has = {}.hasOwnProperty
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
  const version = cfg.apiVersion ? `v${cfg.apiVersion.replace(/^v/, '')}` : 'v1'
  const qs = getQs(query, params)
  const usePost = qs.length > 11264
  const auth = cfg.token ? {Authorization: `Bearer ${cfg.token}`} : undefined
  const type = usePost ? {'content-type': 'application/json'} : undefined
  const headers = Object.assign({}, auth, type)

  const host = !cfg.useCdn || cfg.token || usePost ? apiHost : cdnHost
  const opts = {
    credentials: cfg.withCredentials ? 'include' : 'omit',
    headers,
    method: usePost ? 'POST' : 'GET',
    body: usePost ? JSON.stringify({query, params}) : undefined,
  }

  const url = `https://${cfg.projectId}.${host}/${version}/data/query/${cfg.dataset}`
  return this.fetcher(`${url}${usePost ? '' : qs}`, opts).then(parse)
}

function parse(res) {
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('json')) {
    throw getError(res)
  }

  return res.json().then((json) => {
    if (res.status < 400) {
      return json.result
    }

    throw getError(res, json)
  })
}

function getError(res, json) {
  let msg = res.url
  let type = res.statusText
  if (json && json.error && json.error.description) {
    msg = json.error.description
    type = json.error.type || type
  }

  return new Error(`HTTP ${res.status} ${type}: ${msg}`)
}

function getQs(query, params) {
  let qs = `?query=${enc(query)}`
  if (!params) {
    return qs
  }

  for (const param in params) {
    if (has.call(params, param)) {
      qs += `&${enc(`$${param}`)}=${enc(JSON.stringify(params[param]))}`
    }
  }

  return qs
}

function ni(method) {
  return () => {
    throw new Error(`Method "${method}" not implemented, use @sanity/client`)
  }
}

module.exports = PicoSanity
