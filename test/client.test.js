import {readFileSync} from 'node:fs'
import {join} from 'node:path'

import {vi, test, expect, describe} from 'vitest'

import {createClient} from '../src/node.js'

const pkg = JSON.parse(readFileSync(join(import.meta.dirname, '../package.json'), 'utf8'))

const config = {projectId: '89qx0zd4', dataset: 'sweets', useCdn: true}

// Note: this is a read-only token, so is "safe" to provide here
const token =
  'sk6oecvddLqAa9od7KAk90zxCegaNI4jzEPQBZZPfq66BvEfRwRG4KvExnWtKpspQD601VNypC3RQTNySDT8HRtBzqOQ8QTByLmt8dQAIU8kkna9KmnQctri1u7nVDSq0vkkKEvzHgRolNRjJ2sSvddGHx0TKEK2I9gbteKOV50IbRXcWI5c'

const expectedDoc = {
  _id: '1ba26a25-7f35-4d24-804e-09cc76a0cd73',
  _type: 'category',
  title: 'Japanese',
}

const expectedDraft = {
  ...expectedDoc,
  _id: `drafts.${expectedDoc._id}`,
  title: 'Modified Japanese',
}

const notImplemented = [
  'clone',
  'create',
  'createIfNotExists',
  'createOrReplace',
  'delete',
  'listen',
  'mutate',
  'patch',
  'transaction',
]

test('can construct', () => {
  const client = createClient(config)
  expect(client.config()).toMatchObject(config)
})

test('sets config to `clientConfig` for @sanity/client compat', () => {
  const client = createClient(config)
  expect(client.clientConfig).toMatchObject(config)
})

test('can query', () => {
  const client = createClient(config)
  return expect(
    client.fetch('*[_id == "1ba26a25-7f35-4d24-804e-09cc76a0cd73"][0]'),
  ).resolves.toMatchObject(expectedDoc)
})

test('can query with params', () => {
  const client = createClient(config)
  return expect(
    client.fetch('*[_id == $id][0]', {id: '1ba26a25-7f35-4d24-804e-09cc76a0cd73'}),
  ).resolves.toMatchObject(expectedDoc)
})

test('long queries (>11kB) gets POSTed', () => {
  const client = createClient(config)
  const ws = ' '.repeat(11 * 1024)
  return expect(
    client.fetch(`*[_id == $id]${ws}[0]`, {id: '1ba26a25-7f35-4d24-804e-09cc76a0cd73'}),
  ).resolves.toMatchObject(expectedDoc)
})

test('POSTed queries with perspective', () => {
  const client = createClient({
    ...config,
    token,
    apiVersion: 'v2021-03-25',
    useCdn: false,
    perspective: 'previewDrafts',
  })
  const ws = ' '.repeat(11 * 1024)

  return client.fetch(`*[_id == $id]${ws}[0]`, {id: expectedDoc._id}).then((res) =>
    expect(res).toMatchObject({
      ...expectedDoc,
      title: expectedDraft.title,
      _originalId: expectedDraft._id,
    }),
  )
})

test('can query with token', () => {
  const client = createClient(config)
  const readClient = createClient({...config, token})
  return client
    .fetch('*[_id == $id][0]', {id: expectedDraft._id})
    .then((res) => expect(res).toBe(null))
    .then(() => readClient.fetch('*[_id == $id][0]', {id: expectedDraft._id}))
    .then((draft) => expect(draft).toMatchObject(expectedDraft))
})

test('can reconfigure with .config(newConfig)', () => {
  const client = createClient(config)
  expect(client.config()).toMatchObject(config)
  expect(client.config({projectId: 'abc123'})).toBe(client)
  expect(client.config()).toMatchObject({...config, projectId: 'abc123'})
})

test('can specify api version', () => {
  const client = createClient({...config, apiVersion: 'v2021-03-25'})

  return client
    .fetch('*[_id == $id][0] { _id, _type, title, "description": pt::text(nope) }', {
      id: expectedDoc._id,
    })
    .then((res) => {
      expect(res).toEqual({...expectedDoc, description: null})
    })
})

test('can query with perspectives', () => {
  const client = createClient({
    ...config,
    token,
    apiVersion: 'v2021-03-25',
    useCdn: false,
    perspective: 'previewDrafts',
  })
  return client.fetch('*[_id == $id][0]', {id: expectedDoc._id}).then((res) =>
    expect(res).toMatchObject({
      ...expectedDoc,
      title: expectedDraft.title,
      _originalId: expectedDraft._id,
    }),
  )
})

test('can configure perspectives per-request', () => {
  const client = createClient({
    ...config,
    token,
    apiVersion: 'v2021-03-25',
    useCdn: false,
  })
  return client
    .fetch('*[_id == $id][0]', {id: expectedDoc._id}, {perspective: 'previewDrafts'})
    .then((res) =>
      expect(res).toMatchObject({
        ...expectedDoc,
        title: expectedDraft.title,
        _originalId: expectedDraft._id,
      }),
    )
})

test('per-request perspective overrides client config', () => {
  const client = createClient({
    ...config,
    token,
    apiVersion: 'v2021-03-25',
    useCdn: false,
    perspective: 'previewDrafts',
  })
  return client
    .fetch('*[_id == $id][0]', {id: expectedDoc._id}, {perspective: 'published'})
    .then((res) => {
      expect(res).toMatchObject(expectedDoc)
      expect(res).not.toHaveProperty('_originalId')
    })
})

test('per-request perspective overrides client config (#2)', () => {
  const client = createClient({
    ...config,
    token,
    apiVersion: 'v2021-03-25',
    useCdn: false,
    perspective: 'published',
  })
  return client
    .fetch('*[_id == $id][0]', {id: expectedDoc._id}, {perspective: 'previewDrafts'})
    .then((res) =>
      expect(res).toMatchObject({
        ...expectedDoc,
        title: expectedDraft.title,
        _originalId: expectedDraft._id,
      }),
    )
})

test('includes package name in user agent (in node.js)', () => {
  const client = createClient({...config, apiVersion: 'v2021-03-25'})
  client.fetcher = vi.fn(() =>
    Promise.resolve({
      status: 200,
      headers: {
        get(name) {
          return name === 'content-type' ? 'application/json' : undefined
        },
      },
      json() {
        return Promise.resolve({result: expectedDoc})
      },
    }),
  )

  return client.fetch('*[0]').then((res) => {
    expect(client.fetcher).toHaveBeenCalledWith(
      'https://89qx0zd4.apicdn.sanity.io/v2021-03-25/data/query/sweets?query=*%5B0%5D',
      {headers: {'User-Agent': `${pkg.name}@${pkg.version}`}, method: 'GET'},
    )
    expect(res).toEqual(expectedDoc)
  })
})

test('throws on syntax errors', () => {
  const client = createClient({...config, apiVersion: 'v2021-03-25'})

  return client.fetch('*[_id == "nope"][0] { _id, ').then(
    () => {
      throw new Error('Should not succeed')
    },
    (err) => {
      expect(err.message).toEqual(`HTTP 400 queryParseError: expected '}' following object body`)
    },
  )
})

describe('throws when using unimplemented methods', () => {
  const client = createClient(config)

  notImplemented.forEach((method) => {
    test(method, () => expect(client[method]).toThrow(/not implemented/i))
  })
})
