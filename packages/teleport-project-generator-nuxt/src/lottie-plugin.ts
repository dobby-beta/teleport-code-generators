import { ProjectPlugin, ProjectPluginStructure } from '@teleporthq/teleport-types'

export const NUXT_LOTTIE_PACKAGE = '@lottiefiles/vue-lottie-player'
export const NUXT_LOTTIE_PLUGIN_PATH = '~/plugins/lottie-vue-player.client.js'

/**
 * The lottie player is only installed and registered for projects that really use a
 * `lottie-node` element, so the other projects don't ship it in their bundle.
 * `nuxt.config` lists the plugin when it sees the package in the collected dependencies.
 */
export const nuxtLottiePlugin: ProjectPlugin = {
  runBefore: async (structure: ProjectPluginStructure) => {
    // ponytail: string search over the whole UIDL, walk the node tree if false positives show up
    if (!JSON.stringify(structure.uidl).includes('"lottie-node"')) {
      return structure
    }

    structure.rootFolder.subFolders.push({
      name: 'plugins',
      files: [
        {
          name: 'lottie-vue-player.client.js',
          content: `
import Vue from 'vue';

import LottieVuePlayer from "${NUXT_LOTTIE_PACKAGE}";

Vue.use(LottieVuePlayer);
          `,
        },
      ],
      subFolders: [],
    })

    structure.dependencies[NUXT_LOTTIE_PACKAGE] = '1.0.4'
    return structure
  },
  runAfter: async (structure: ProjectPluginStructure) => structure,
}
