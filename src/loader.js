const sharp = require('sharp')
const loaderUtils = require('loader-utils')

module.exports.raw = true
module.exports = async function(content, map, meta) {
  this.cacheable()
  const callback = this.async()
  const {
    srcKey = 'src',
    previewKey = 'preview',
    ratioKey = 'ratio',
    resizeOptions = null,
  } = loaderUtils.getOptions(this) || {}

  const img = sharp(this.resourcePath)
  const imgMeta = await img.metadata()
  const lowImg = await img
    .resize(
      imgMeta.width < imgMeta.height ? imgMeta.width : null,
      imgMeta.height < imgMeta.width ? imgMeta.height : null,
      { ...resizeOptions }
    )
    .toBuffer()

  const srcPath = loaderUtils.interpolateName(this, 'img/[hash:7].[ext]', {
    content: content,
  })
  const lowPath = loaderUtils.interpolateName(this, 'img/lqip-[hash:7].[ext]', {
    content: lowImg,
  })

  this.emitFile(srcPath, content)
  this.emitFile(lowPath, lowImg)

  const result = `module.exports = {
    ${srcKey}: __webpack_public_path__ + ${JSON.stringify(srcPath)},
    ${ratioKey}: ${imgMeta.width / imgMeta.height},
    ${previewKey}: __webpack_public_path__ + ${JSON.stringify(lowPath)},
  }
  `

  callback(null, result, map, meta)
}
