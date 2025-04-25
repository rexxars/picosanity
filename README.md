# picosanity

[![npm version](https://img.shields.io/npm/v/picosanity.svg?style=flat-square)](http://browsenpm.org/package/picosanity)[![npm bundle size](https://img.shields.io/bundlephobia/minzip/picosanity?style=flat-square)](https://bundlephobia.com/result?p=picosanity)

Tiny Sanity client alternative, if you only need to do queries and only need to support modern browsers.

## Targets

- Node.js >= 20
- Modern browsers (Edge >= 14, Chrome, Safari, Firefox etc)

## Installation

```bash
npm install --save picosanity
```

## Usage

```js
import {createClient} from 'picosanity'

const client = createClient({
  projectId: 'myProjectId',
  dataset: 'myDataset',
  apiVersion: '2025-04-25', // use a UTC date string
  useCdn: true,
})

client
  .fetch('*[_type == $someType]', {someType: 'article'})
  .then((articles) => console.log(articles))
  .catch((err) => console.error('Oh noes: %s', err.message))
```

## UMD bundle

You can load this module as a UMD-bundle from unpkg - https://unpkg.com/picosanity  
If used in a global browser context, it will be available as `window.PicoSanity.createClient()`

## License

MIT © [Espen Hovlandsdal](https://espen.codes/)
