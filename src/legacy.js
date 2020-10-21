const getIt = require('get-it')
const Client = require('./client')

const request = getIt([{onReturn}])

module.exports = function (cfg) {
  return new Client(cfg, (input, init) => fetchish(input, init))
}

function fetchish(url, options) {
  const opts = options || {}
  return request({
    url,
    headers: opts.headers,
    withCredentials: opts.credentials === 'include',
  })
}

function onReturn(channels, context) {
  return new Promise((resolve, reject) => {
    channels.error.subscribe(reject)
    channels.response.subscribe((res) => resolve({json: () => JSON.parse(res.body)}))
    channels.request.publish(context)
  })
}
