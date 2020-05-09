const { ESBuildPlugin } = require('esbuild-loader')

module.exports = {
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: 'esbuild-loader',
        options: {
          target: 'es2015', // default, or 'es20XX', 'esnext'
        },
      },
    ],
  },
  plugins: [new ESBuildPlugin()],
}
