import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    addModalVisible: false,
    deleteModalVisible: false,
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
  }
})