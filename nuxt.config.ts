// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '~/assets/css/style.css',
    'vue-final-modal/style.css',
  ],
  plugins: [
    '~/plugins/bootstrap.client.ts'
  ],
  modules: [
    '@pinia/nuxt',
    '@vue-final-modal/nuxt',
  ],
  typescript: {
    strict: true
  },
  ssr: false // Para mantener compatibilidad con el código existente que usa DOM
})