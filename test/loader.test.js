import compiler from './compiler.js'

test('tes image', async () => {
  const stats = await compiler('assets/logo.png')
  const output = stats.toJson().modules[0].source
  expect(output).toMatch(/^module\.exports = \{$/gm)
  expect(output).toMatch(/^ *src: (.*),$/gm)
  expect(output).toMatch(/^ *ratio: (.*),$/gm)
  expect(output).toMatch(/^ *preview: 'data:(.*)',$/gm)
})
