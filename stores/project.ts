import { defineStore } from 'pinia'
import ProjectController from '../src/controllers/ProjectController'
import type { Item } from '../src/models/Item'
import type { Scale } from '../src/views/ganttHelpers'
import { getFormItemValues, clearAddItemForm } from '../src/controllers/addItemValues'
import { itemToFormValues } from '../src/controllers/dataHelpers'

export const useProjectStore = defineStore('project', {
  state: () => ({
    controller: ProjectController.getInstance(),
    projectStartDate: new Date(),
    projectEndDate: new Date(),
    newStartDate: new Date().toISOString().split('T')[0],
    currentScale: 'week' as Scale,
    isEditing: false,
    itemToDelete: null as number | null,
    isInitialized: false
  }),
  
  actions: {
    async initializeProject() {
      if (this.isInitialized) return
      
      try {
        const response = await fetch('/project.json')
        if (!response.ok) throw new Error('No se pudo cargar project.json')
        const json = await response.json()
        this.controller.loadProjectFromFile(json)
      } catch (err) {
        console.warn('No se pudo cargar project.json:', err)
        this.controller.createNewProject(new Date())
        this.controller.chargeExampleProject()
      }
      
      this.updateProjectDates()
      this.isInitialized = true
    },
    
    updateProjectDates() {
      const project = this.controller.getProject()
      this.projectStartDate = project.getProjectStartDate()
      this.projectEndDate = project.getProjectEndDate()
    },
    
    newProject() {
      this.controller.createNewProject(new Date())
      this.updateProjectDates()
      this.renderAll()
    },
    
    resetActualStartDates() {
      this.controller.resetActualStartDates()
      this.updateProjectDates()
      this.renderAll()
    },
    
    async loadProjectFromFile(file: File) {
      try {
        await this.controller.loadProjectFromFile(file)
        this.updateProjectDates()
        this.renderAll()
      } catch (error) {
        console.error('Error loading project:', error)
      }
    },
    
    saveProject() {
      this.controller.downloadProjectAsJSON()
    },
    
    changeStartDate() {
      if (this.newStartDate) {
        this.controller.changeStartDate(new Date(this.newStartDate))
        this.updateProjectDates()
        this.renderAll()
      }
    },
    
    exportPDF() {
      console.log('Export PDF functionality to be implemented')
    },
    
    addNewItem() {
      const formValues = getFormItemValues()
      this.controller.addNewItem(formValues)
      clearAddItemForm(this.controller.getProject())
      this.renderAll()
    },
    
    editItem(item: Item) {
      // Esta función se llamará desde el componente
      const formValues = getFormItemValues()
      this.controller.editItem(item.id, formValues)
      clearAddItemForm(this.controller.getProject())
      this.renderAll()
    },
    
    deleteItem() {
      if (this.itemToDelete !== null) {
        this.controller.deleteItem(this.itemToDelete)
        this.itemToDelete = null
        this.renderAll()
      }
    },
    
    renderAll() {
      // Actualizar fechas del proyecto
      this.updateProjectDates()
      
      // Recalcular fechas de los items
      this.controller.getProject().calculateItemDates()
      
      // Actualizar colores de los items
      setProjectItemsColors(this.controller.getProject())
    },
    
    setupItemForEdit(item: Item) {
      this.isEditing = true
      // Aquí puedes preparar el formulario para editar
    }
  }
})