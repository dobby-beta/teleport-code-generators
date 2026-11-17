import {
  createNextProjectGenerator,
  NextTemplate,
} from '@teleporthq/teleport-project-generator-next'
import { ProjectPluginCSSModules } from '../../../teleport-project-plugin-css-modules'
import projectSample from '../../../../examples/test-samples/project-with-import-global-styles.json'
import { FileType, ProjectType } from '@teleporthq/teleport-types'

// The "about" page of the sample is renamed and given a style of its own, plus a reference
// to the project style set, so it imports both the global sheet and its own sheet.
const withStyledPage = (pageName: string) => {
  const uidl = JSON.parse(JSON.stringify(projectSample))
  const route = uidl.root.stateDefinitions.route.values.find((v: { value: string }) => {
    return v.value === 'about'
  })
  route.value = pageName
  route.pageOptions = { navLink: `/${pageName}`, fileName: pageName, componentName: 'Styled' }

  const pageNode = uidl.root.node.content.children.find(
    (child: { content: { value: string } }) => child.content.value === 'about'
  )
  pageNode.content.value = pageName
  pageNode.content.node.content.style = { color: { type: 'static', content: 'red' } }
  pageNode.content.node.content.referencedStyles = {
    projectRef: {
      id: 'projectRef',
      type: 'style-map',
      content: { mapType: 'project-referenced', referenceId: 'primaryButton' },
    },
  }
  return uidl
}

describe('Global style sheet name, NEXT + css-modules', () => {
  it.each(['style', 'global-style', 'about-us'])(
    'keeps the global and the own style sheet of a page named "%s" as two imports',
    async (pageName) => {
      const generator = createNextProjectGenerator()
      generator.addPlugin(new ProjectPluginCSSModules({ framework: ProjectType.NEXT }))
      const result = await generator.generateProject(withStyledPage(pageName), NextTemplate)

      const pages = result.subFolders.find((folder) => folder.name === 'pages')
      const cssNames = pages.files.filter((f) => f.fileType === FileType.CSS).map((f) => f.name)
      const page = pages.files.find((f) => f.name === pageName && f.fileType === FileType.JS)
      const ownSheet = pageName === 'global-style' ? 'global-style-page' : pageName

      expect(cssNames).toContain('global-style.module')
      expect(cssNames).toContain(`${ownSheet}.module`)
      expect(page.content).toContain(`import projectStyles from './global-style.module.css'`)
      expect(page.content).toContain(`import styles from './${ownSheet}.module.css'`)
      expect(page.content).not.toMatch(/projectStyles,\s*\{/)
      expect(page.content.indexOf('projectStyles')).toBeLessThan(page.content.indexOf(' styles '))
    }
  )
})
