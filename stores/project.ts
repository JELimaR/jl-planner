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
        const response = await fetch('/template00.jlprj')
        if (!response.ok) throw new Error('No se pudo cargar template00.jlprj')
        const JSON = await response.json()
        this.controller.loadProjectFromFile(JSON)
      } catch (err) {
        console.warn('No se pudo cargar template00.jlprj:', err)
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
        this.controller.changeStartDate(textToDate(this.newStartDate))
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

/**
 * Convierte una cadena de fecha con formato DD-MM-YYYY en un objeto Date.
 *
 * @param {string | undefined} dateString La fecha en formato "dd-mm-yyyy".
 * @returns {Date | null} Un objeto Date o null si la cadena no es válida.
 */
const textToDate = (dateString: string | undefined): Date | null => {
  if (!dateString) {
    return null;
  }

  const parts = dateString.split('-');

  if (parts.length !== 3) {
    return null;
  }
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }
  
  // El mes en JavaScript es de 0 a 11, por eso se resta 1.
  const newDate = new Date(year, month - 1, day);

  // Validación final para evitar fechas incorrectas (ej. 30 de febrero).
  if (
    newDate.getFullYear() !== year || 
    newDate.getMonth() !== month - 1 || 
    newDate.getDate() !== day
  ) {
    return null;
  }
  
  return newDate;
};