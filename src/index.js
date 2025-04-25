import {createClient as create} from './client.js'

export function createClient(cfg) {
  const fetcher = (input, init) => fetch(input, init)
  return create(cfg, {fetch: fetcher})
}
