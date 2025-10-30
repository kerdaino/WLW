import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'cvypf2o3',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,

    // ✅ Add your App ID so you won’t be prompted again
    appId: 'i7u5rhvv48omgef826i1tw48',
  }
})
