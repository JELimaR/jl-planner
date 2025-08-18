import { defineStore } from 'pinia'
import type { IProjectData, IProjectHeader } from '../src/models/Project'
import type { IItemData } from '../src/models/Item'
import { formatDateToDisplay, TDateString } from '../src/models/dateFunc'
import { Scale } from '../components/gantt/ganttHelpers'
import { SpendingMethod } from '../src/controllers/ProjectController'
import { IProcessData } from '../src/models/Process' // ✅ Importación movida a la parte superior

export const useProjectStore = defineStore('project', {
  state: () => ({
    templates: [] as IProjectHeader[],
    projectData: null as IProjectData | null,

    currentScale: 'week' as Scale,
    itemToDelete: null as IItemData | null,
    itemToEdit: null as IItemData | null,
    // ❌ Eliminado: isInitialized: false,
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    // ✅ Nuevo getter computado
    isInitialized: (state) => state.projectData !== null,
    projectId: (state) => state.projectData?.id,
    projectTitle: (state) => state.projectData?.title || '',
    projectSubtitle: (state) => state.projectData?.subtitle || '',
    projectStartDate: (state) => state.projectData?.startDate,
    projectEndDate: (state) => state.projectData?.endDate,
    projectItems: (state) => state.projectData?.items || [],
    criticalPaths: (state) => state.projectData?.criticalPaths || [],
  },

  actions: {
    setError(error: string | null) {
      this.error = error
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    async getTemplateHeaders() {
      console.log('🔄 Acción: getTemplateHeaders - Reiniciando estado...')
      this.$reset()
      this.setLoading(true)
      this.setError(null)

      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'getTemplateHeaders',
          }
        })

        if ((response as { success: boolean }).success) {
          this.templates = (response as { data: IProjectHeader[] }).data;
          console.log('✅ getTemplateHeaders - Headers obtenidos:', this.templates.length)
        }
      } catch (error) {
        console.error('❌ Error getting template headers:', error)
        this.setError('Error al obtener la plantilla')
      } finally {
        this.setLoading(false)
      }
    },

    async getTemplate(tid: string, source = 'Desconocido') {
      console.log(`🔄 Acción: getTemplate - Llamada desde: ${source}`)
      this.$reset()
      this.setLoading(true)
      this.setError(null)
      console.log('🔍 Estado inicial del projectData:', this.projectData)

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
          // ❌ Eliminado: this.isInitialized = true
          console.log('✅ getTemplate - Datos del proyecto respuesta:', response.data)

        }
      } catch (error) {
        console.error('❌ Error getting template:', error)
        this.setError('Error al obtener la plantilla')
      } finally {
        console.log('🏁 Final de la acción getTemplate. Estado final:', this.projectData)
        this.setLoading(false)
      }
    },

    async newProject(startDate?: Date) {
      console.log('🔄 Acción: newProject - Creando nuevo proyecto...')
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
          this.projectData = (response as { data: IProjectData }).data
          // ❌ Eliminado: this.isInitialized = true
          console.log('✅ newProject - Nuevo proyecto creado:', this.projectData?.title)
        }
      } catch (error) {
        console.error('❌ Error creating new project:', error)
        this.setError('Error al crear nuevo proyecto')
      } finally {
        this.setLoading(false)
      }
    },

    async getDailySpending(spendingMethod: SpendingMethod) {
      this.setLoading(true);
      this.setError(null);

      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'getDailySpending',
            data: { spendingMethod }
          }
        });

        if ((response as { success: boolean }).success) {
          return (response as { data: Array<{ d: string, v: number }> }).data;
        }
      } catch (error) {
        console.error('Error getting daily spending data:', error);
        this.setError('Error al obtener datos de gasto diario.');
      } finally {
        this.setLoading(false);
      }
    },

    async changeOrder(itemId: number, sense: 'up' | 'down') {
      console.log('🔄 Acción: changeOrder - Cambiando orden del ítem:', itemId, sense)
      this.setLoading(true)
      console.log('🔍 Estado actual del projectData:', this.projectData)

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
          console.log('✅ changeOrder - Orden actualizada. Nuevo proyecto:', this.projectData?.items.map(item => item.id))
        }
      } catch (error) {
        console.error('❌ Error changing item order:', error)
        this.setError('Error al reordenar el ítem')
      } finally {
        this.setLoading(false)
      }
    },

    async resetActualStartDates() {
      this.setLoading(true)
      console.log('🔄 Acción: resetActualStartDates')

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
          console.log('✅ Fechas reseteadas:', this.projectData?.items.map(item => ({ id: item.id, startDate: item.startDate })))
        }
      } catch (error) {
        console.error('❌ Error resetting actual start dates:', error)
        this.setError('Error al resetear fechas')
      } finally {
        this.setLoading(false)
      }
    },

    async loadProjectFromFile(file: File) {
      console.log('🔄 Acción: loadProjectFromFile')
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
          // ❌ Eliminado: this.isInitialized = true
          console.log('✅ Proyecto cargado desde archivo:', this.projectData?.title)
        }
      } catch (error) {
        console.error('❌ Error loading project from file:', error)
        this.setError('Error al cargar el archivo del proyecto')
      } finally {
        this.setLoading(false)
      }
    },

    async saveTitle(title: string, subtitle: string) {
      console.log('🔄 Acción: saveTitle - Guardando título:', title)

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
          if (this.projectData) {
            this.projectData.title = title
            this.projectData.subtitle = subtitle
          }
          // ❌ Eliminado: this.isInitialized = true
          console.log('✅ Título y subtítulo guardados con éxito.')
        }
      } catch (error) {
        console.error('❌ Error saving title:', error)
        this.setError('Error al guardar el título')
      }
    },

    async changeStartDate(newStartDate: TDateString) {
      console.log('🔄 Acción: changeStartDate - Nueva fecha de inicio:', newStartDate)
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
          console.log('✅ Fecha de inicio cambiada. Nueva fecha:', this.projectData?.startDate)
        }
      } catch (error) {
        console.error('❌ Error changing start date:', error)
        this.setError('Error al cambiar la fecha de inicio')
      } finally {
        this.setLoading(false)
      }
    },

    async addNewItem(data: IItemData) {
      console.log('🔄 Acción: addNewItem - Agregando nuevo ítem:', data.name)
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
          console.log('✅ Ítem añadido. Total de ítems:', this.projectData?.items.length)
        }
      } catch (error) {
        console.error('❌ Error adding new item:', error)
        this.setError('Error al agregar el ítem')
      } finally {
        this.setLoading(false)
      }
    },

    async editItem(data: IItemData) {
      console.log('🔄 Acción: editItem - Editando ítem:', data.id)
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
          console.log('✅ Ítem editado:', this.projectData?.items.find(item => item.id === data.id)?.name)
        }
      } catch (error) {
        console.error('❌ Error editing item:', error)
        this.setError('Error al editar el ítem')
      } finally {
        this.setLoading(false)
      }
    },

    async deleteItem() {
      if (this.itemToDelete === null) return
      console.log('🔄 Acción: deleteItem - Eliminando ítem:', this.itemToDelete.id)

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
          console.log('✅ Ítem eliminado. Total de ítems restantes:', this.projectData?.items.length)
          this.itemToDelete = null
        }
      } catch (error) {
        console.error('❌ Error deleting item:', error)
        this.setError('Error al eliminar el ítem')
      } finally {
        this.setLoading(false)
      }
    },

    saveProject() {
      if (!this.projectData) return
      console.log('🔄 Acción: saveProject - Descargando archivo JSON')

      const dataToSave = {
        ...this.projectData,
        criticalPaths: []
      };

      const dataStr = JSON.stringify(dataToSave, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${this.projectData.title || 'proyecto'}.prj`
      link.click()
      URL.revokeObjectURL(url)
      console.log('✅ Archivo JSON preparado para descarga.')
    },

    async downloadProject() {
      console.log('🔄 Acción: downloadProject - Solicitando descarga desde el servidor')
      try {
        const response = await fetch('/api/project?type=download')
        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${this.projectTitle || 'proyecto'}.prj`
          link.click()
          URL.revokeObjectURL(url)
          console.log('✅ Descarga desde servidor iniciada.')
        } else {
          console.error('❌ Error al descargar el proyecto desde el servidor. Respuesta no OK.')
          this.setError('Error al descargar el proyecto')
        }
      } catch (error) {
        console.error('❌ Error downloading project:', error)
        this.setError('Error al descargar el proyecto')
      }
    },

    setupItemForEdit(item: IItemData | null) {
      this.itemToEdit = item;
      console.log('🔍 Ítem configurado para editar:', item ? item.id : 'null')
    },

    setupItemForDelete(item: IItemData | null) {
      this.itemToDelete = item;
      console.log('🔍 Ítem configurado para eliminar:', item ? item.id : 'null')
    },

    async exportPDF() {
      console.log('🔄 Acción: exportPDF - Solicitando exportación a PDF')
      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'exportPDF',
            data: {}
          }
        })

        if ((response as { success: boolean }).success) {
          console.log('✅ Exportación a PDF exitosa:', (response as { message: string }).message)
        }
      } catch (error) {
        console.error('❌ Error exporting PDF:', error)
        this.setError('Error al exportar PDF')
      }
    },
  }
})

// Funciones auxiliares movidas fuera del store para modularidad
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

    if (iid.type === 'process' && (iid as IProcessData).children) {
      const processItem = iid as IProcessData;
      const childrenFlattened = flattenItemsListWithDepth(processItem.children, depth + 1);
      childrenFlattened.forEach(c => flattenedList.push(c));
    }
  }

  return flattenedList;
}