const sharp = require('sharp')
const loaderUtils = require('loader-utils')

const SUPPORTED_MIMES = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
}

async function generateLowQualityImage(
  path,
  source,
  { srcKey = 'src', previewKey = 'preview', ratioKey = 'ratio' }
) {
  const img = sharp(path)
  const meta = await img.metadata()
  const mimeType = SUPPORTED_MIMES[meta.format]
  if (!mimeType) throw new Error(`Unsupported format "${meta.format}"`)
  const lowImg = await img.resize(10).toBuffer()

  return `module.exports = {
    ${srcKey}: ${source},
    ${ratioKey}: ${meta.width / meta.height},
    ${previewKey}: 'data:${mimeType};base64,${lowImg.toString('base64')}',
  }`
}

module.exports.raw = true
module.exports = function(contentBuffer) {
  this.cacheable()
  const callback = this.async()
  const options = loaderUtils.getOptions(this) || {}
  const urlRegex = /^(module\.exports =|export default) "data:(.*)base64,(.*)/
  const fileRegex = /^(module\.exports =|export default) (.*)/
  let content = contentBuffer.toString('utf8')

  const isUrlExport = urlRegex.test(content)
  const isFileExport = fileRegex.test(content)
  let source = ''

  if (isUrlExport) {
    source = content.match(fileRegex)[2]
  } else {
    if (!isFileExport) {
      const fileLoader = require('file-loader')
      content = fileLoader.call(this, content)
    }
    source = content.match(/^(module\.exports =|export default) (.*);/)[2]
  }

  generateLowQualityImage(this.resourcePath, source, options)
    .then(z => callback(null, z))
    .catch(callback)
}
