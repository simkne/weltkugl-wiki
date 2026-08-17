export default defineNuxtConfig({
  extends: ['docus'],

  vite: {
    plugins: [
      {
        // Workaround for nuxt/nuxt issue: the nostics dev reporter module calls
        // createHotContext() at top level, which races the Vite client's
        // hmrClient initialization and throws "Cannot access 'hmrClient before
        // initialization" in dev. The reporter is best-effort only (warns and
        // continues when import.meta.hot is absent), so it's safe to strip the
        // injected top-level HMR hookup for that module.
        name: 'strip-nostics-dev-hmr-hookup',
        transform(code, id) {
          if (id.includes('nostics') && id.includes('reporters') && id.includes('dev')) {
            // Replace import.meta.hot with undefined so Vite's import-analysis
            // sees no HMR usage and skips injecting the top-level
            // createHotContext() call. The reporter falls back to its
            // console.warn branch (harmless, best-effort diagnostics only).
            return code.replace(/import\.meta\.hot/g, 'undefined')
          }
        },
      },
    ],
  },

  // The wiki lives in a subfolder on the live site: https://weltkugl.net/docus/
  app: {
    baseURL: '/docus/',
  },

  // robots.txt must sit at the domain root, not under /docus/ — we add it
  // manually on the server instead of letting nuxt-robots generate one.
  robots: {
    robotsTxt: false,
  },

  // Site configuration - domain only, path handled by app.baseURL
  site: {
    url: 'https://weltkugl.net',
  },

  // Used by nuxt-llms to generate absolute links in /llms.txt
  llms: {
    domain: 'https://weltkugl.net/docus',
  },
})
