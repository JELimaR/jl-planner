// @ts-ignore - Funciones globales de Nuxt
export default defineNuxtRouteMiddleware((to, from) => {
  // Solo ejecutar en el cliente
  if (process.server) return

  // @ts-ignore - useAuthStore es auto-importado
  const authStore = useAuthStore()
  
  // Restaurar sesión si existe
  authStore.restoreSession()
  
  // Verificar si está autenticado y es admin
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    // @ts-ignore - navigateTo es una función global de Nuxt
    return navigateTo('/login')
  }
  
  // Verificar si el token ha expirado
  if (authStore.tokenExpiration && authStore.tokenExpiration <= new Date()) {
    authStore.logout()
    // @ts-ignore - navigateTo es una función global de Nuxt
    return navigateTo('/login')
  }
})