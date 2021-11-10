# Change Log

All notable changes will be documented in this file.

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
