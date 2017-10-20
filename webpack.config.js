const path = require('path');

module.exports = {
  entry: './js/script.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  node: {
    console: false,
    global: true,
    process: true,
    Buffer: true,
    __filename: "mock",
    __dirname: "mock",
    setImmediate: true
  }
};
