const Client = require('../lib')

const config = {projectId: '89qx0zd4', dataset: 'sweets', useCdn: true}

const expectedDoc = {
  _id: '1ba26a25-7f35-4d24-804e-09cc76a0cd73',
  _type: 'category',
  title: 'Japanese'
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
  'transaction'
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

test('can reconfigure with .config(newConfig)', () => {
  const client = new Client(config)
  expect(client.config()).toMatchObject(config)
  expect(client.config({projectId: 'abc123'})).toBe(client)
  expect(client.config()).toMatchObject({...config, projectId: 'abc123'})
})

describe('throws when using unimplemented methods', () => {
  const client = new Client(config)

  notImplemented.forEach(method => {
    test(method, () => expect(client[method]).toThrow(/not implemented/i))
  })
})
