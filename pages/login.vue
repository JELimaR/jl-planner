<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2 class="text-center mb-4">
          <i class="bi bi-box-arrow-in-right"></i>
          Iniciar Sesión
        </h2>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="mb-3">
          <label for="username" class="form-label">Usuario</label>
          <input id="username" v-model="username" type="text" class="form-control" :class="{ 'is-invalid': error }"
            placeholder="UT123456 o X123456" maxlength="8" required :disabled="isLoading" />
          <div class="form-text">
            Formato: UT123456 o X123456
          </div>
        </div>

        <div class="mb-4">
          <label for="password" class="form-label">Contraseña</label>
          <input id="password" v-model="password" type="password" class="form-control" :class="{ 'is-invalid': error }"
            placeholder="Ingresa tu contraseña" required :disabled="isLoading" />
        </div>

        <div v-if="error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle"></i>
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="isLoading || !username || !password">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-box-arrow-in-right me-2"></i>
          {{ isLoading ? 'Verificando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div class="login-footer mt-4 text-center">
        <small class="text-muted">
          <i class="bi bi-info-circle"></i>
          Ingresa con tu usuario y contraseña
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

// Configurar meta de la página
// @ts-ignore - definePageMeta es una función global de Nuxt
definePageMeta({
  layout: 'empty' // Usar layout vacío
})

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

// Verificar si ya está autenticado
onMounted(() => {
  authStore.restoreSession()
  if (authStore.isAuthenticated) {
    // Redirigir según el rol del usuario
    if (authStore.isAdmin) {
      router.push('/admin')
    } else {
      router.push('/projects')
    }
  }
})

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const result = await authStore.login(username.value, password.value)

    if (result.success) {
      // Redirigir según el rol del usuario
      if (authStore.isAdmin) {
        await router.push('/admin')
      } else {
        await router.push('/projects')
      }
    } else {
      error.value = result.error || 'Error de autenticación'
    }
  } catch (err) {
    error.value = 'Error de conexión'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.login-header h2 {
  color: #333;
  font-weight: 600;
}

.login-form .form-control {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  padding: 12px 16px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.login-form .form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.login-form .form-control.is-invalid {
  border-color: #dc3545;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert {
  border-radius: 8px;
  border: none;
}

.login-footer {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

.bi {
  font-size: 1.1em;
}
</style>