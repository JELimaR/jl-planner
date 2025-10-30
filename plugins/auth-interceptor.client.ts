export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  // Interceptor para agregar token a las peticiones
  $fetch.create({
    onRequest({ request, options }) {
      // Solo agregar token a peticiones de API internas
      if (typeof request === 'string' && request.startsWith('/api/')) {
        if (authStore.token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${authStore.token}`
          }
        }
      }
    },
    
    onResponseError({ response }) {
      // Si recibimos 401, el token expiró
      if (response.status === 401) {
        authStore.logout()
        navigateTo('/login')
      }
    }
  })

  // Verificar expiración del token cada minuto
  if (process.client) {
    setInterval(() => {
      if (authStore.isAuthenticated) {
        if (authStore.isTokenExpiringSoon()) {
          console.warn('Token expirará pronto')
          // Aquí podrías mostrar una notificación al usuario
        }
        
        // Verificar si ya expiró
        if (authStore.tokenExpiration && authStore.tokenExpiration <= new Date()) {
          console.log('Token expirado, cerrando sesión')
          authStore.logout()
          navigateTo('/login')
        }
      }
    }, 60000) // Cada minuto
  }
})