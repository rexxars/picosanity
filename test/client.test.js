const Client = require('../src')
const pkg = require('../package.json')

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

test('can construct with `new`', () => {
  const client = new Client(config)
  expect(client.config()).toMatchObject(config)
})

test('can construct without `new`', () => {
  const client = Client(config)
  expect(client.config()).toMatchObject(config)
})

test('sets config to `clientConfig` for @sanity/client compat', () => {
  const client = new Client(config)
  expect(client.clientConfig).toMatchObject(config)
})

test('can query', () => {
  const client = new Client(config)
  return expect(
    client.fetch('*[_id == "1ba26a25-7f35-4d24-804e-09cc76a0cd73"][0]')
  ).resolves.toMatchObject(expectedDoc)
})

test('can query with params', () => {
  const client = new Client(config)
  return expect(
    client.fetch('*[_id == $id][0]', {id: '1ba26a25-7f35-4d24-804e-09cc76a0cd73'})
  ).resolves.toMatchObject(expectedDoc)
})

test('long queries (>11kB) gets POSTed', () => {
  const client = new Client(config)
  const ws = ' '.repeat(11 * 1024)
  return expect(
    client.fetch(`*[_id == $id]${ws}[0]`, {id: '1ba26a25-7f35-4d24-804e-09cc76a0cd73'})
  ).resolves.toMatchObject(expectedDoc)
})

test('can query with token', () => {
  const client = new Client(config)
  const readClient = new Client({...config, token})
  return client
    .fetch('*[_id == $id][0]', {id: expectedDraft._id})
    .then((res) => expect(res).toBe(null))
    .then(() => readClient.fetch('*[_id == $id][0]', {id: expectedDraft._id}))
    .then((draft) => expect(draft).toMatchObject(expectedDraft))
})

test('can reconfigure with .config(newConfig)', () => {
  const client = new Client(config)
  expect(client.config()).toMatchObject(config)
  expect(client.config({projectId: 'abc123'})).toBe(client)
  expect(client.config()).toMatchObject({...config, projectId: 'abc123'})
})

test('can specify api version', () => {
  const client = new Client({...config, apiVersion: 'v2021-03-25'})

  return client
    .fetch('*[_id == $id][0] { _id, _type, title, "description": pt::text(nope) }', {
      id: expectedDoc._id,
    })
    .then((res) => {
      expect(res).toEqual({...expectedDoc, description: null})
    })
})

test('can query with perspectives', () => {
  const client = new Client({
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
    })
  )
})

test('can configure perspectives per-request', () => {
  const client = new Client({
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
      })
    )
})

test('per-request perspective overrides client config', () => {
  const client = new Client({
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
  const client = new Client({
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
      })
    )
})

test('includes package name in user agent (in node.js)', () => {
  const client = new Client({...config, apiVersion: 'v2021-03-25'})
  client.fetcher = jest.fn(() =>
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
    })
  )

  return client.fetch('*[0]').then((res) => {
    expect(client.fetcher).toHaveBeenCalledWith(
      'https://89qx0zd4.apicdn.sanity.io/v2021-03-25/data/query/sweets?query=*%5B0%5D',
      {headers: {'User-Agent': `${pkg.name}@${pkg.version}`}, method: 'GET'}
    )
    expect(res).toEqual(expectedDoc)
  })
})

test('throws on syntax errors', () => {
  const client = new Client({...config, apiVersion: 'v2021-03-25'})

  return client.fetch('*[_id == "nope"][0] { _id, ').then(
    () => {
      throw new Error('Should not succeed')
    },
    (err) => {
      expect(err.message).toEqual(`HTTP 400 queryParseError: expected '}' following object body`)
    }
  )
})

describe('throws when using unimplemented methods', () => {
  const client = new Client(config)

  notImplemented.forEach((method) => {
    test(method, () => expect(client[method]).toThrow(/not implemented/i))
  })
})
