import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    addModalVisible: false,
    deleteModalVisible: false,
    projectTitle: 'JL Planner',
    projectSubtitle: 'Planificador de Proyectos'
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
    
    updateProjectTitle(title: string) {
      this.projectTitle = title
    },
    
    updateProjectSubtitle(subtitle: string) {
      this.projectSubtitle = subtitle
    }
  }
})