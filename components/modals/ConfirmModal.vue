<template>
  <VueFinalModal
    :model-value="uiStore.confirmModal.isOpen"
    :lock-scroll="true"
    :teleport-to="'body'"
    overlay-class="modal-overlay"
    content-class="modal-content"
    @closed="closeModal"
  >
    <div class="modal-header">
      <h5 class="modal-title">
        <i :class="iconClass" class="me-2"></i>
        {{ uiStore.confirmModal.title }}
      </h5>
      <button type="button" class="btn-close" aria-label="Close" @click="closeModal"></button>
    </div>
    
    <div class="modal-body">
      <div v-if="uiStore.confirmModal.message" class="mb-3">
        {{ uiStore.confirmModal.message }}
      </div>
      
      <div v-if="uiStore.confirmModal.details" class="alert alert-info">
        <small v-html="uiStore.confirmModal.details"></small>
      </div>
    </div>
    
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">
        {{ uiStore.confirmModal.cancelText || 'Cancelar' }}
      </button>
      <button 
        type="button" 
        :class="['btn', confirmButtonClass]" 
        @click="confirmAction"
      >
        {{ uiStore.confirmModal.confirmText || 'Confirmar' }}
      </button>
    </div>
  </VueFinalModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { useUIStore } from '../../stores/ui'

const uiStore = useUIStore()

const iconClass = computed(() => {
  const type = uiStore.confirmModal.type || 'info'
  const icons = {
    info: 'bi bi-info-circle text-info',
    warning: 'bi bi-exclamation-triangle text-warning',
    danger: 'bi bi-exclamation-triangle text-danger',
    success: 'bi bi-check-circle text-success'
  }
  return icons[type as keyof typeof icons] || icons.info
})

const confirmButtonClass = computed(() => {
  const type = uiStore.confirmModal.type || 'info'
  const classes = {
    info: 'btn-primary',
    warning: 'btn-warning',
    danger: 'btn-danger',
    success: 'btn-success'
  }
  return classes[type as keyof typeof classes] || classes.info
})

const closeModal = () => {
  uiStore.closeConfirmModal()
}

const confirmAction = () => {
  if (uiStore.confirmModal.onConfirm) {
    uiStore.confirmModal.onConfirm()
  }
  closeModal()
}
</script>

<style scoped>
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  cursor: pointer;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  opacity: 0.5;
}

.btn-close:hover {
  opacity: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}
</style>