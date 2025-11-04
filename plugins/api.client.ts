import { useAuthStore } from '../stores/auth'
import { navigateTo } from 'nuxt/app'

// @ts-ignore
export default defineNuxtPlugin(() => {
  // Interceptar todas las peticiones $fetch para agregar el token automáticamente
  $fetch.create({
    onRequest({ request, options }) {
      // Solo agregar token a peticiones de la API
      if (typeof request === 'string' && request.startsWith('/api/')) {
        const authStore = useAuthStore()

        if (authStore.token) {
          // Agregar el token al header Authorization
          options.headers = new Headers(options.headers)
          options.headers.set('Authorization', `Bearer ${authStore.token}`)
        }
      }
    },

    onResponseError({ response }) {
      // Si recibimos 401, el token probablemente expiró
      if (response.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()

        // Redirigir al login si no estamos ya ahí
        if (!window.location.pathname.includes('/login')) {
          navigateTo('/login')
        }
      }
    }
  })
})