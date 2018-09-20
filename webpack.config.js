const slsw = require('serverless-webpack')

const es = {}
Object.keys(slsw.lib.entries).forEach(
  k => (es[k] = ['./source-map-install.js', slsw.lib.entries[k]])
)

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: es,
  devtool: 'source-map',
  resolve: { extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'] },
  target: 'node',
  module: { rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }] },
  externals: [require('webpack-node-externals')()]
}
