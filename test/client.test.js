const Client = require('../src')

const config = {projectId: '89qx0zd4', dataset: 'sweets', useCdn: true}
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

test('can query with token', (done) => {
  const client = new Client(config)
  const readClient = new Client({...config, token})
  client
    .fetch('*[_id == $id][0]', {id: 'drafts.1ba26a25-7f35-4d24-804e-09cc76a0cd73'})
    .then((res) => {
      expect(res).toBe(null)
      return readClient
        .fetch('*[_id == $id][0]', {id: 'drafts.1ba26a25-7f35-4d24-804e-09cc76a0cd73'})
        .then((draft) => expect(draft).toMatchObject(expectedDraft))
        .then(done)
    })
})

test('can reconfigure with .config(newConfig)', () => {
  const client = new Client(config)
  expect(client.config()).toMatchObject(config)
  expect(client.config({projectId: 'abc123'})).toBe(client)
  expect(client.config()).toMatchObject({...config, projectId: 'abc123'})
})

test('can specify api version', (done) => {
  const client = new Client({...config, apiVersion: 'v2021-03-25'})

  client
    .fetch('*[_id == $id][0] { _id, _type, title, "description": pt::text(nope) }', {
      id: '1ba26a25-7f35-4d24-804e-09cc76a0cd73',
    })
    .then((res) => {
      expect(res).toEqual({...expectedDoc, description: null})
      done()
    })
})

test('throws on syntax errors', (done) => {
  const client = new Client({...config, apiVersion: 'v2021-03-25'})

  client.fetch('*[_id == "nope"][0] { _id, ').then(
    () => {
      throw new Error('Should not succeed')
    },
    (err) => {
      expect(err.message).toEqual(`HTTP 400 queryParseError: expected '}' following object body`)
      done()
    }
  )
})

describe('throws when using unimplemented methods', () => {
  const client = new Client(config)

  notImplemented.forEach((method) => {
    test(method, () => expect(client[method]).toThrow(/not implemented/i))
  })
})
