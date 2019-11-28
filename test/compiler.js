import path from 'path'
import webpack from 'webpack'
import memoryfs from 'memory-fs'

export default fixture => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: { path: path.resolve(__dirname), filename: 'bundle.js' },
    module: {
      rules: [
        {
          test: /\.png$/,
          use: { loader: path.resolve(__dirname, '../src/loader.js') },
        },
      ],
    },
  })

  compiler.outputFileSystem = new memoryfs()

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)
      if (stats.hasErrors()) reject(new Error(stats.toJson().errors))

      resolve(stats)
    })
  })
}
