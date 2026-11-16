import { ProjectUIDL } from '@teleporthq/teleport-types'
import uidlSample from '../../../examples/test-samples/project-sample.json'
import { createNuxtProjectGenerator, NuxtTemplate } from '../src'

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
  const out = await createNuxtProjectGenerator().generateProject(
    buildUidl(withLottie),
    JSON.parse(JSON.stringify(NuxtTemplate))
  )
  return {
    pkg: out.files.find((file) => file.name === 'package')?.content || '',
    config: out.files.find((file) => file.name === 'nuxt.config')?.content || '',
    plugin: out.subFolders.find((f) => f.name === 'plugins'),
  }
}

describe('Nuxt project lottie player', () => {
  it('is not installed or registered when no page uses lottie', async () => {
    const { pkg, config, plugin } = await generate(false)
    expect(pkg).not.toContain('lottie')
    expect(config).not.toContain('lottie')
    expect(plugin).toBeUndefined()
  })

  it('is installed and registered when a page uses lottie', async () => {
    const { pkg, config, plugin } = await generate(true)
    expect(pkg).toContain('"@lottiefiles/vue-lottie-player": "1.0.4"')
    expect(config).toContain('~/plugins/lottie-vue-player.client.js')
    expect(plugin?.files[0].name).toBe('lottie-vue-player.client.js')
  })
})
