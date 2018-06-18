const Client = require('../src/client')

const expectedDoc = {
  _id: '1ba26a25-7f35-4d24-804e-09cc76a0cd73',
  _type: 'category',
  title: 'Japanese'
}

const notImplemented = [
  'clone',
  'config',
  'create',
  'createIfNotExists',
  'createOrReplace',
  'delete',
  'listen',
  'mutate',
  'patch',
  'transaction'
]

test('can query', () => {
  const client = new Client({projectId: '89qx0zd4', dataset: 'sweets', useCdn: true})
  return expect(
    client.fetch('*[_id == "1ba26a25-7f35-4d24-804e-09cc76a0cd73"][0]')
  ).resolves.toMatchObject(expectedDoc)
})

test('can query with params', () => {
  const client = new Client({projectId: '89qx0zd4', dataset: 'sweets', useCdn: true})
  return expect(
    client.fetch('*[_id == $id][0]', {id: '1ba26a25-7f35-4d24-804e-09cc76a0cd73'})
  ).resolves.toMatchObject(expectedDoc)
})

test('can instantiate client without `new` keyword', () => {
  const client = Client({projectId: '89qx0zd4', dataset: 'sweets', useCdn: true})
  return expect(
    client.fetch('*[_id == "1ba26a25-7f35-4d24-804e-09cc76a0cd73"][0]')
  ).resolves.toMatchObject(expectedDoc)
})

describe('throws when using unimplemented methods', () => {
  const client = new Client({projectId: '89qx0zd4', dataset: 'sweets', useCdn: true})

  notImplemented.forEach(method => {
    test(method, () => expect(client[method]).toThrow(/not implemented/i))
  })
})
