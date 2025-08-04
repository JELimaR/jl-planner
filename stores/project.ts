import { defineStore } from 'pinia'
import ProjectController from '../src/controllers/ProjectController'
import type { Scale } from '../src/views/ganttHelpers'
import { setProjectItemsColors } from '../src/views/colors'
import { FormItemValues } from '../src/controllers/addItemValues'

export const useProjectStore = defineStore('project', {
  state: () => ({
    controller: ProjectController.getInstance(''),
    projectStartDate: new Date(),
    projectEndDate: new Date(),
    newStartDate: new Date(),
    currentScale: 'week' as Scale,
    itemToDelete: null as number | null,
    isInitialized: false
  }),
  
  actions: {
    // In the project store, update the initializeProject method
    async initializeProject(projectId?: string) {
      try {
        if (projectId) {
          // Load specific project by ID
          // Implement your project loading logic here
          console.log('Loading project:', projectId)
        } else {
          // Load default project or handle no project case
          console.log('Loading default project')
        }
        const response = await fetch('/project.json')
        if (!response.ok) throw new Error('No se pudo cargar project.json')
        const json = await response.json()
        this.controller.loadProjectFromFile(json)
      } catch (err) {
        console.warn('No se pudo cargar project.json:', err)
        this.controller.createNewProject('creato', new Date())
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
      this.controller.createNewProject('idP', new Date())
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
    
    addNewItem(formValues: FormItemValues) {
      this.controller.addNewItem(formValues)
      this.renderAll()
    },
    
    editItem(formValues: FormItemValues) {
      // Esta función se llamará desde el componente
      console.log(formValues)
      this.controller.editItem(formValues.id, formValues);
      this.renderAll();
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
    
    setupItemForEdit(id: number) {
      this.itemToEdit = id
      // Aquí puedes preparar el formulario para editar
    }
  }
})