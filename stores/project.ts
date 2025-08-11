import { defineStore } from 'pinia'
import type { Scale } from '../src/views/ganttHelpers'
import type { IProjectData, IProjectHeader } from '../src/models/Project'
import type { IItemData } from '../src/models/Item'
import { formatDateToDisplay, TDateString } from '../src/models/dateFunc'
import { IProcessData } from '../src/models/Process'

export const useProjectStore = defineStore('project', {
  state: () => ({
    // Estado basado en IProjectData
    projectData: null as IProjectData | null,

    // Estados de UI
    currentScale: 'week' as Scale,
    itemToDelete: null as IItemData | null,
    itemToEdit: null as IItemData | null,
    isInitialized: false,
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    // Getters computados para acceso fácil a datos del proyecto
    projectId: (state) => state.projectData?.id,
    projectTitle: (state) => state.projectData?.title || '',
    projectSubtitle: (state) => state.projectData?.subtitle || '',
    projectStartDate: (state) => state.projectData?.startDate,
    projectEndDate: (state) => state.projectData?.endDate,
    projectItems: (state) => state.projectData?.items || [],
    criticalPath: (state) => state.projectData?.criticalPath || [],
  },

  actions: {
    // Manejo de errores centralizado
    setError(error: string | null) {
      this.error = error
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    // 🆕 Obtener plantilla por ID
    async getTemplate(tid: string) {
      this.setLoading(true)
      this.setError(null)

      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'getTemplate',
            data: { tid }
          }
        })

        if ((response as { success: boolean }).success) {
          this.projectData = (response as { data: IProjectData }).data
        }
      } catch (error) {
        console.error('Error getting template:', error)
        this.setError('Error al obtener la plantilla')
      } finally {
        this.setLoading(false)
      }
    },

    // Crear nuevo proyecto
    async newProject(startDate?: Date) {
      this.setLoading(true)
      this.setError(null)

      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'newProject',
            data: { startDate: formatDateToDisplay(startDate) }
          }
        })

        if ((response as { success: boolean }).success) {
          console.log(response)
          this.projectData = (response as { data: IProjectData }).data
          // await this.loadProjectHeader()
        }
      } catch (error) {
        console.error('Error creating new project:', error)
        this.setError('Error al crear nuevo proyecto')
      } finally {
        this.setLoading(false)
      }
    },

    // Cambiar orden de item
    async changeOrder(itemId: number, sense: 'up' | 'down') {
      this.setLoading(true)

      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'changeOrder',
            data: { itemId, sense }
          }
        })

        if ((response as { success: boolean }).success) {
          this.projectData = (response as { data: IProjectData }).data
          // await this.loadProjectHeader()
        }
      } catch (error) {
        console.error('Error changing item order:', error)
        this.setError('Error al reordenar el ítem')
      } finally {
        this.setLoading(false)
      }
    },

    // Resetear fechas actuales
    async resetActualStartDates() {
      this.setLoading(true)

      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'resetActualStartDates',
            data: {}
          }
        })

        if ((response as { success: boolean }).success) {
          this.projectData = (response as { data: IProjectData }).data
          // await this.loadProjectHeader()
        }
      } catch (error) {
        console.error('Error resetting actual start dates:', error)
        this.setError('Error al resetear fechas')
      } finally {
        this.setLoading(false)
      }
    },

    // Cargar proyecto desde archivo
    async loadProjectFromFile(file: File) {
      this.setLoading(true)
      this.setError(null)

      try {
        const text = await file.text()
        const jsonData = JSON.parse(text)

        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'loadFromFile',
            data: { jsonData }
          }
        })

        if ((response as { success: boolean }).success) {
          this.projectData = (response as { data: IProjectData }).data
          // await this.loadProjectHeader()
        }
      } catch (error) {
        console.error('Error loading project from file:', error)
        this.setError('Error al cargar el archivo del proyecto')
      } finally {
        this.setLoading(false)
      }
    },

    // Guardar título y subtítulo
    async saveTitle(title: string, subtitle: string) {
      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'saveTitle',
            data: { title, subtitle }
          }
        })

        if ((response as { success: boolean }).success) {
          this.projectHeader = (response as { data: IProjectHeader }).data
          // Actualizar también en projectData
          if (this.projectData) {
            this.projectData.title = title
            this.projectData.subtitle = subtitle
          }
        }
      } catch (error) {
        console.error('Error saving title:', error)
        this.setError('Error al guardar el título')
      }
    },

    // Cambiar fecha de inicio
    async changeStartDate(newStartDate: TDateString) {
      this.setLoading(true)

      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'changeStartDate',
            data: { startDate: newStartDate }
          }
        })

        if ((response as { success: boolean }).success) {
          this.projectData = (response as { data: IProjectData }).data
          // await this.loadProjectHeader()
        }
      } catch (error) {
        console.error('Error changing start date:', error)
        this.setError('Error al cambiar la fecha de inicio')
      } finally {
        this.setLoading(false)
      }
    },

    // Agregar nuevo item
    async addNewItem(data: IItemData) {
      this.setLoading(true)

      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'addItem',
            data: { itemData: data }
          }
        })

        if ((response as { success: boolean }).success) {
          this.projectData = (response as { data: IProjectData }).data
          // await this.loadProjectHeader()
        }
      } catch (error) {
        console.error('Error adding new item:', error)
        this.setError('Error al agregar el ítem')
      } finally {
        this.setLoading(false)
      }
    },

    // Editar item
    async editItem(data: IItemData) {
      this.setLoading(true)

      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'editItem',
            data: { id: data.id, itemData: data }
          }
        })

        if ((response as { success: boolean }).success) {
          this.projectData = (response as { data: IProjectData }).data
          // await this.loadProjectHeader()
        }
      } catch (error) {
        console.error('Error editing item:', error)
        this.setError('Error al editar el ítem')
      } finally {
        this.setLoading(false)
      }
    },

    // Eliminar item
    async deleteItem() {
      if (this.itemToDelete === null) return

      this.setLoading(true)

      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'deleteItem',
            data: { id: this.itemToDelete.id }
          }
        })

        if ((response as { success: boolean }).success) {
          this.projectData = (response as { data: IProjectData }).data
          // await this.loadProjectHeader()
          this.itemToDelete = null
        }
      } catch (error) {
        console.error('Error deleting item:', error)
        this.setError('Error al eliminar el ítem')
      } finally {
        this.setLoading(false)
      }
    },

    // Descargar proyecto como JSON
    saveProject() {
      if (!this.projectData) return

      const dataStr = JSON.stringify(this.projectData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${this.projectData.title || 'proyecto'}.jlprj`
      link.click()
      URL.revokeObjectURL(url)
    },

    // Configurar item para editar
    setupItemForEdit(item: IItemData | null) {
      this.itemToEdit = item;
    },

    // Configurar item para eliminar
    setupItemForDelete(item: IItemData | null) {
      this.itemToDelete = item;
    },

    // Cargar proyecto de ejemplo
    async loadExampleProject() {
      this.setLoading(true)
      this.setError(null)

      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'loadExample',
            data: {}
          }
        })

        if ((response as { success: boolean }).success) {
          this.projectData = (response as { data: IProjectData }).data
          // await this.loadProjectHeader()
        }
      } catch (error) {
        console.error('Error loading example project:', error)
        this.setError('Error al cargar el proyecto de ejemplo')
      } finally {
        this.setLoading(false)
      }
    },

    // Exportar PDF
    async exportPDF() {
      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'exportPDF',
            data: {}
          }
        })

        if ((response as { success: boolean }).success) {
          console.log('PDF export:', (response as { message: string }).message)
          // Implementar lógica de exportación PDF aquí
        }
      } catch (error) {
        console.error('Error exporting PDF:', error)
        this.setError('Error al exportar PDF')
      }
    },

    // Descargar proyecto desde servidor
    async downloadProject() {
      try {
        const response = await fetch('/api/project?type=download')
        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${this.projectTitle || 'proyecto'}.jlprj`
          link.click()
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error('Error downloading project:', error)
        this.setError('Error al descargar el proyecto')
      }
    }
  }
})

/**
* Función que genera una lista plana de items, expandiendo los procesos para incluir sus hijos.
*
* @param items La lista de items de entrada, que puede contener procesos.
* @returns Una lista plana y única de items.
*/
export function flattenItemsList(items: IItemData[]): IItemData[] {
  const flattenedList: IItemData[] = [];
  
  for (const iid of items) {
    flattenedList.push(iid);
    
    // Si el item es un proceso, añade recursivamente sus hijos
    if (iid.type === 'process' && (iid as IProcessData).children) {
      const processItem = iid as IProcessData;
      const childrenFlattened = flattenItemsList(processItem.children);
      childrenFlattened.forEach(c => flattenedList.push(c))
    }
  }

  return flattenedList;
}

/**
 * Función que genera una lista plana de ítems, expandiendo los procesos para incluir a sus hijos
 * y agregando el nivel de profundidad de cada ítem.
 *
 * @param items La lista de ítems de entrada, que puede contener procesos.
 * @param depth El nivel de profundidad inicial (0 por defecto).
 * @returns Una lista plana de ítems con su profundidad.
 */
export function flattenItemsListWithDepth(items: IItemData[], depth = 0): { item: IItemData, depth: number }[] {
  const flattenedList: { item: IItemData, depth: number }[] = [];
  
  for (const iid of items) {
    flattenedList.push({ item: iid, depth });
    
    // Si el ítem es un proceso, añade recursivamente sus hijos con un nivel de profundidad aumentado
    if (iid.type === 'process' && (iid as IProcessData).children) {
      const processItem = iid as IProcessData;
      const childrenFlattened = flattenItemsListWithDepth(processItem.children, depth + 1);
      childrenFlattened.forEach(c => flattenedList.push(c));
    }
  }

  return flattenedList;
}