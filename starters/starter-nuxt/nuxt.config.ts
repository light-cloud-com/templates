// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s | Nuxt App',
    },
  },
  runtimeConfig: {
    public: {
      // Overridden at runtime by NUXT_PUBLIC_SITE_NAME.
      siteName: 'Nuxt App',
    },
  },
})
