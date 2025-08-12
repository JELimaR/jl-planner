import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    addModalVisible: false,
    deleteModalVisible: false,
    criticalPathIndex: undefined as number | undefined,
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
    }

  }
})