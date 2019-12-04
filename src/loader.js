const sharp = require('sharp')
const loaderUtils = require('loader-utils')

module.exports = async function(_, map, meta) {
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
  const orgImg = await img.clone().toBuffer()
  const lowImg = await img
    .clone()
    .resize(
      imgMeta.width < imgMeta.height ? 10 : null,
      imgMeta.height < imgMeta.width ? 10 : null,
      { ...resizeOptions }
    )
    .toBuffer()

  const srcPath = loaderUtils.interpolateName(this, 'img/[hash:7].[ext]', {
    content: orgImg,
    context: this.rootContext,
  })
  const lowPath = loaderUtils.interpolateName(this, 'img/lqip-[hash:7].[ext]', {
    content: lowImg,
    context: this.rootContext,
  })

  this.emitFile(srcPath, orgImg)
  this.emitFile(lowPath, lowImg)

  const result = `module.exports = {
    ${srcKey}: __webpack_public_path__ + ${JSON.stringify(srcPath)},
    ${ratioKey}: ${imgMeta.width / imgMeta.height},
    ${previewKey}: __webpack_public_path__ + ${JSON.stringify(lowPath)},
  }
  `

  callback(null, result, map, meta)
}
