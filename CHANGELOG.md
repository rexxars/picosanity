# Change Log

All notable changes will be documented in this file.

## 4.1.1

### Fixed

- Fixed perspective query parameter being sent as POST-body instead of query parameter on large queries. Thanks @niklas-may!

## 4.1.0

### Added

- Support for [perspectives](https://www.sanity.io/blog/introducing-perspectives-sanity-previews) on either a client level or query level. Thanks @jjjjjx!

## 4.0.0

### BREAKING

- BREAKING: Passing a `token` _and_ `useCdn: true` will now use the API CDN for queries, where it previously used the uncached, "live" API.

## 3.0.3

### Fixed

- Fixed an issue where certain environments would throw an error when `credentials` was provided to `fetch` with the value of `undefined`

## 3.0.2

### Changed

- Implicitly add support for CloudFlare Workers and other non-browser, non-node environments by not referencing `window`, not passing `credentials` option to `fetch()`

## 3.0.1

### Added

- Support large queries by automatically switching to non-CDN API and using HTTP POST method.

### Changed

- Improved error handling on non-JSON HTTP responses

## 3.0.0

### BREAKING

- Support for Node 10 dropped.

### Added

- Support `apiVersion` in config

### Changed

- Improve error handling

## 2.2.0

### Changed

- Compile for IE11 compatibility (if global fetch polyfill is present)

## 2.1.0

### Added

- Support `token` in constructor

## 2.0.3

### Added

- Typescript definitions

## 2.0.0

### BREAKING

- Support for Node 6 and Internet Explorer dropped. Only Edge >= 14 is now supported (Promise and fetch APIs needs to exist)
