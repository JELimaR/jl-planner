// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '~/assets/css/style.css'
  ],
  plugins: [
    '~/plugins/bootstrap.client.ts'
  ],
  typescript: {
    strict: true
  },
  ssr: false // Para mantener compatibilidad con el código existente que usa DOM
})