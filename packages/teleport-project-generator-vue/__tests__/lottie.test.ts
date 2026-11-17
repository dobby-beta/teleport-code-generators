import { ProjectUIDL } from '@teleporthq/teleport-types'
import uidlSample from '../../../examples/test-samples/project-sample.json'
import { createVueProjectGenerator, VueTemplate } from '../src'

const buildUidl = (withLottie: boolean) => {
  const uidl = JSON.parse(JSON.stringify(uidlSample)) as ProjectUIDL
  if (withLottie) {
    const indexPage = (uidl.root.node.content.children || []).find(
      (child) =>
        child.type === 'conditional' && (child.content as { value?: string }).value === 'index'
    )
    ;(indexPage as any).content.node.content.children.push({
      type: 'element',
      content: {
        elementType: 'lottie-node',
        name: 'lottie1',
        attrs: { src: { type: 'static', content: 'https://example.com/data.json' } },
      },
    })
  }
  return uidl
}

const generate = async (withLottie: boolean) => {
  const out = await createVueProjectGenerator().generateProject(
    buildUidl(withLottie),
    JSON.parse(JSON.stringify(VueTemplate))
  )
  const pkg = out.files.find((file) => file.name === 'package')?.content || ''
  const main = out.subFolders.find((f) => f.name === 'src')?.files.find((f) => f.name === 'main')
  return { pkg, main: main?.content || '' }
}

describe('Vue project lottie player', () => {
  it('is not installed or registered when no page uses lottie', async () => {
    const { pkg, main } = await generate(false)
    expect(pkg).not.toContain('lottie')
    expect(main).not.toContain('Lottie')
  })

  it('is installed and registered when a page uses lottie', async () => {
    const { pkg, main } = await generate(true)
    expect(pkg).toContain('"@lottiefiles/vue-lottie-player": "1.0.4"')
    expect(main).toContain(`import LottieVuePlayer from '@lottiefiles/vue-lottie-player'`)
    expect(main).toContain('Vue.use(LottieVuePlayer)')
  })
})
