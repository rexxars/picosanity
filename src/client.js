const enc = encodeURIComponent
const has = {}.hasOwnProperty
const apiHost = 'api.sanity.io'
const cdnHost = 'apicdn.sanity.io'

function PicoSanity(config, options) {
  if (!(this instanceof PicoSanity)) {
    return new PicoSanity(config)
  }

  this.clientConfig = config
  this.fetcher = options.fetch
  this.headers = options.headers || {}
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

PicoSanity.prototype.fetch = function (query, params, options) {
  const cfg = this.clientConfig
  const version = cfg.apiVersion ? `v${cfg.apiVersion.replace(/^v/, '')}` : 'v1'
  const perspective = options ? options.perspective : cfg.perspective
  const qsGet = getQs(query, params, {perspective})
  const qsPost = !!perspective && perspective !== 'raw' ? `?perspective=${enc(perspective)}` : ''
  const usePost = qsGet.length > 11264
  const qs = usePost ? qsPost : qsGet
  const auth = cfg.token ? {Authorization: `Bearer ${cfg.token}`} : undefined
  const type = usePost ? {'content-type': 'application/json'} : undefined
  const headers = Object.assign({}, this.headers, auth, type)

  const host = cfg.useCdn ? cdnHost : apiHost
  const opts = {
    headers,
    method: usePost ? 'POST' : 'GET',
  }

  if (usePost) {
    opts.body = JSON.stringify({query, params})
  }

  // Some environments (like CloudFlare Workers) don't support credentials
  // in fetch() RequestInitDict, and there doesn't seem to be any easy way
  // to check of it, so for now we'll make do with a window check :/
  if (typeof window !== 'undefined') {
    opts.credentials = cfg.withCredentials ? 'include' : 'omit'
  }

  const url = `https://${cfg.projectId}.${host}/${version}/data/query/${cfg.dataset}${qs}`

  return this.fetcher(url, opts).then(parse)
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

function getQs(query, params, opts) {
  let qs = `?query=${enc(query)}`

  if (opts.perspective) {
    qs += `&perspective=${enc(opts.perspective)}`
  }

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
