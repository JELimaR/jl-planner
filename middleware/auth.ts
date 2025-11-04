export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Si no hay autenticación, redirigir al login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})