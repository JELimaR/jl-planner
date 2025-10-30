import { ref, computed } from 'vue'

interface ToastMessage {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration: number
}

// ============================================
// VARIABLE DE CONTROL - CAMBIA ESTO PARA HABILITAR/DESHABILITAR
// ============================================
const TOASTS_ENABLED = true  // Cambia a false para deshabilitar todos los toasts
// ============================================

// Estado global de toasts
const toasts = ref<ToastMessage[]>([])



export const useToast = () => {
  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 5000
  ) => {
    // Si los toasts están deshabilitados, no hacer nada
    if (!TOASTS_ENABLED) {
      return null
    }

    // Evitar duplicados del mismo mensaje
    const existingToast = toasts.value.find(t => t.title === title && t.message === message)
    if (existingToast) {
      return existingToast.id
    }

    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

    const toast: ToastMessage = {
      id,
      title,
      message,
      type,
      duration
    }

    toasts.value.push(toast)

    // Auto-remover después del tiempo especificado
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAllToasts = () => {
    toasts.value = []
  }

  // Métodos de conveniencia
  const showSuccess = (title: string, message: string, duration: number = 4000) => {
    return showToast(title, message, 'success', duration)
  }

  const showError = (title: string, message: string, duration: number = 6000) => {
    return showToast(title, message, 'error', duration)
  }

  const showInfo = (title: string, message: string, duration: number = 4000) => {
    return showToast(title, message, 'info', duration)
  }

  const showWarning = (title: string, message: string, duration: number = 5000) => {
    return showToast(title, message, 'warning', duration)
  }

  const isEnabled = computed(() => TOASTS_ENABLED)

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast,
    clearAllToasts,
    isEnabled
  }
}