import {createClient as create} from './client.js'

const USER_AGENT = 'picosanity@5.0.0'

export function createClient(cfg) {
  return create(cfg, {
    headers: {'User-Agent': USER_AGENT},
    fetch,
  })
}
