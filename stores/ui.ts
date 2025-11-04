import { defineStore } from 'pinia'

interface ConfirmModalState {
  isOpen: boolean
  title: string
  message: string
  details?: string
  type?: 'info' | 'warning' | 'danger' | 'success'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
}

export const useUIStore = defineStore('ui', {
  state: () => ({
    addModalVisible: false,
    deleteModalVisible: false,
    criticalPathIndex: undefined as number | undefined,
    confirmModal: {
      isOpen: false,
      title: '',
      message: '',
      details: '',
      type: 'info',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm: undefined
    } as ConfirmModalState,
  }),
  
  actions: {
    openAddModal() {
      this.addModalVisible = true
    },
    
    closeAddModal() {
      this.addModalVisible = false
    },
    
    openDeleteModal() {
      this.deleteModalVisible = true
    },
    
    closeDeleteModal() {
      this.deleteModalVisible = false
    },
    setCriticalPathIndex(index: number) {
      this.criticalPathIndex = index
    },
    removeCriticalPathIndex() {
      this.criticalPathIndex = undefined
    },

    // Métodos para el modal de confirmación
    openConfirmModal(options: {
      title: string
      message: string
      details?: string
      type?: 'info' | 'warning' | 'danger' | 'success'
      confirmText?: string
      cancelText?: string
      onConfirm?: () => void
    }) {
      this.confirmModal = {
        isOpen: true,
        title: options.title,
        message: options.message,
        details: options.details,
        type: options.type || 'info',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        onConfirm: options.onConfirm
      }
    },

    closeConfirmModal() {
      this.confirmModal.isOpen = false
      this.confirmModal.onConfirm = undefined
    }
  }
})