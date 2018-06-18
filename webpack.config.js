const path = require('path')

module.exports = {
  entry: path.join(__dirname, 'lib', 'client.js'),
  output: {
    library: 'PicoSanity',
    libraryTarget: 'umd',
    path: path.join(__dirname, 'umd'),
    filename: 'client.js'
  }
}
