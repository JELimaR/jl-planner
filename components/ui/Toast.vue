<template>
  <div 
    :class="['custom-toast', 'show', `toast-${type}`]" 
    role="alert" 
    aria-live="assertive" 
    aria-atomic="true"
  >
    <div class="toast-header">
      <i :class="iconClass" class="me-2"></i>
      <strong class="me-auto">{{ title }}</strong>
      <button 
        type="button" 
        class="btn-close" 
        @click="$emit('close', id)"
        aria-label="Close"
      ></button>
    </div>
    <div class="toast-body">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration: number
}

const props = defineProps<Props>()

defineEmits<{
  close: [id: string]
}>()

const iconClass = computed(() => {
  const icons = {
    success: 'bi bi-check-circle-fill text-success',
    error: 'bi bi-x-circle-fill text-danger',
    warning: 'bi bi-exclamation-triangle-fill text-warning',
    info: 'bi bi-info-circle-fill text-info'
  }
  return icons[props.type] || icons.info
})
</script>

<style scoped>
.custom-toast {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  margin-bottom: 0.25rem;
  min-width: 250px;
  max-width: 280px;
  opacity: 1;
  transform: translateX(0);
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.custom-toast.show {
  opacity: 1;
  transform: translateX(0);
}

.toast-header {
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  border-top-left-radius: calc(0.25rem - 1px);
  border-top-right-radius: calc(0.25rem - 1px);
  display: flex;
  align-items: center;
  padding: 0.375rem 0.5rem;
  font-size: 0.8rem;
}

.toast-body {
  padding: 0.5rem;
  font-size: 0.8rem;
  line-height: 1.3;
}

.btn-close {
  background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='m.235 1.027 1.027-.235 6.738 6.738 6.738-6.738 1.027.235-6.738 6.738 6.738 6.738-1.027.235-6.738-6.738-6.738 6.738-1.027-.235 6.738-6.738-6.738-6.738z'/%3e%3c/svg%3e") center/0.8em auto no-repeat;
  border: 0;
  border-radius: 0.25rem;
  opacity: 0.5;
  padding: 0.2em 0.2em;
  width: 0.8em;
  height: 0.8em;
  cursor: pointer;
}

.btn-close:hover {
  opacity: 0.75;
}

.toast-success {
  border-left: 3px solid #198754;
}

.toast-error {
  border-left: 3px solid #dc3545;
}

.toast-warning {
  border-left: 3px solid #ffc107;
}

.toast-info {
  border-left: 3px solid #0dcaf0;
}

.me-2 {
  margin-right: 0.375rem;
}

.me-auto {
  margin-right: auto;
}
</style>