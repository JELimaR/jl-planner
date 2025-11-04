import { defineNuxtPlugin } from 'nuxt/app'
import { useAuthStore } from '../stores/auth'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  // Interceptor para agregar token a las peticiones
  $fetch.create({
    onRequest({ request, options }) {
      // Solo agregar token a peticiones de API internas
      if (typeof request === 'string' && request.startsWith('/api/')) {
        if (authStore.token) {
          options.headers = options.headers || {}
          // @ts-ignore - Headers puede tener propiedades arbitrarias
          options.headers.Authorization = `Bearer ${authStore.token}`
        }
      }
    },

    onResponseError({ response }) {
      // Si recibimos 401, el token expiró
      if (response.status === 401) {
        authStore.logout()
        // @ts-ignore - navigateTo está disponible globalmente en Nuxt
        navigateTo('/login')
      }
    }
  })


})