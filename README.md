# picosanity

[![npm version](https://img.shields.io/npm/v/picosanity.svg?style=flat-square)](http://browsenpm.org/package/picosanity)[![Build Status](https://img.shields.io/travis/rexxars/picosanity/master.svg?style=flat-square)](https://travis-ci.org/rexxars/picosanity)

Tiny Sanity client alternative should you only need to do queries.

## Targets

- Node.js >= 4
- Modern browsers (Edge, Chrome, Safari, Firefox etc)
- IE if Promise is polyfilled

## Installation

```bash
npm install --save picosanity
```

## Usage

```js
const PicoSanity = require('picosanity')

const client = new PicoSanity({
  projectId: 'myProjectId',
  dataset: 'myDataset',
  useCdn: true
})

client
  .fetch('*[_type == $someType]', {someType: 'article'})
  .then(articles => console.log(articles))
  .catch(err => console.error('Oh noes: %s', err.message))
```

## License

MIT © [Espen Hovlandsdal](https://espen.codes/)
