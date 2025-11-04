import { defineStore } from 'pinia'

interface User {
  id?: string // ID del usuario (MongoDB _id)
  username: string
  name: string
  surname: string
  role: 'admin' | 'user'
  createdAt: string
}

interface LoginResponse {
  success: boolean
  user?: User
  token?: string
  expiresIn?: string
  error?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    tokenExpiration: null as Date | null,
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    currentUser: (state) => state.user?.username || null
  },

  actions: {
    setError(error: string | null) {
      this.error = error
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    async login(username: string, password: string) {
      this.setLoading(true)
      this.setError(null)

      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { username, password }
        }) as LoginResponse

        if (response.success && response.user && response.token) {
          console.log('🔍 Usuario recibido del login:', response.user)
          this.user = response.user
          this.token = response.token
          this.isAuthenticated = true
          
          // Calcular tiempo de expiración
          const expiresInMs = this.parseExpirationTime(response.expiresIn || '60m')
          this.tokenExpiration = new Date(Date.now() + expiresInMs)
          
          // Guardar en localStorage para persistencia
          if (process.client) {
            localStorage.setItem('auth_token', response.token)
            localStorage.setItem('auth_user', JSON.stringify(response.user))
            localStorage.setItem('auth_expiration', this.tokenExpiration.toISOString())
          }
          
          return { success: true }
        } else {
          this.setError(response.error || 'Credenciales inválidas')
          return { success: false, error: response.error || 'Credenciales inválidas' }
        }
      } catch (error) {
        console.error('Error en login:', error)
        this.setError('Error de conexión')
        return { success: false, error: 'Error de conexión' }
      } finally {
        this.setLoading(false)
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.tokenExpiration = null
      this.isAuthenticated = false
      this.error = null
      
      // Limpiar localStorage
      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_expiration')
      }
    },

    // Restaurar sesión desde localStorage
    restoreSession() {
      if (process.client) {
        const savedToken = localStorage.getItem('auth_token')
        const savedUser = localStorage.getItem('auth_user')
        const savedExpiration = localStorage.getItem('auth_expiration')
        
        if (savedToken && savedUser && savedExpiration) {
          try {
            const expirationDate = new Date(savedExpiration)
            
            // Verificar si el token no ha expirado
            if (expirationDate > new Date()) {
              this.token = savedToken
              this.user = JSON.parse(savedUser)
              this.tokenExpiration = expirationDate
              this.isAuthenticated = true
              console.log('🔍 Sesión restaurada, usuario:', this.user)
            } else {
              // Token expirado, limpiar
              this.logout()
            }
          } catch (error) {
            console.error('Error al restaurar sesión:', error)
            this.logout()
          }
        }
      }
    },

    // Verificar si el token está próximo a expirar (menos de 5 minutos)
    isTokenExpiringSoon(): boolean {
      if (!this.tokenExpiration) return false
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
      return this.tokenExpiration <= fiveMinutesFromNow
    },

    // Parsear tiempo de expiración (ej: "60m", "1h", "30s")
    parseExpirationTime(expiresIn: string): number {
      const match = expiresIn.match(/^(\d+)([smhd])$/)
      if (!match) return 60 * 60 * 1000 // Default: 1 hora
      
      const value = parseInt(match[1])
      const unit = match[2]
      
      switch (unit) {
        case 's': return value * 1000
        case 'm': return value * 60 * 1000
        case 'h': return value * 60 * 60 * 1000
        case 'd': return value * 24 * 60 * 60 * 1000
        default: return 60 * 60 * 1000
      }
    }
  }
})