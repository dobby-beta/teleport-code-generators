import { ProjectPlugin, ProjectPluginStructure } from '@teleporthq/teleport-types'

const LOTTIE_PACKAGE = '@lottiefiles/vue-lottie-player'
const LOTTIE_VERSION = '1.0.4'

/**
 * The lottie player is only installed and registered for projects that really use a
 * `lottie-node` element, so the other projects don't ship it in their bundle.
 */
export const vueLottiePlugin: ProjectPlugin = {
  runBefore: async (structure: ProjectPluginStructure) => {
    // ponytail: string search over the whole UIDL, walk the node tree if false positives show up
    if (!JSON.stringify(structure.uidl).includes('"lottie-node"')) {
      return structure
    }

    const mainFile = structure.rootFolder.subFolders
      .find((folder) => folder.name === 'src')
      ?.files.find((file) => file.name === 'main')

    if (mainFile) {
      mainFile.content = mainFile.content
        .replace(
          `import router from './router'`,
          `import router from './router'\nimport LottieVuePlayer from '${LOTTIE_PACKAGE}'`
        )
        .replace('Vue.config.productionTip', 'Vue.use(LottieVuePlayer)\nVue.config.productionTip')
    }

    structure.dependencies[LOTTIE_PACKAGE] = LOTTIE_VERSION
    return structure
  },
  runAfter: async (structure: ProjectPluginStructure) => structure,
}
