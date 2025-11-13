import { defineStore } from 'pinia'
import type { IProjectData, IProjectDataDB, IProjectHeader } from '../src/models/Project'
import type { IItemData } from '../src/models/Item'
import { formatDateToDisplay, TDateString } from '../src/models/dateFunc'
import { Scale } from '../components/gantt/ganttHelpers'
import { SpendingMethod } from '../src/controllers/ProjectController'
import { IProcessData } from '../src/models/Process' // ✅ Importación movida a la parte superior
import { useToast } from '../composables/useToast'
import { useAuthStore } from './auth'
import { useUIStore } from './ui'

export const useProjectStore = defineStore('project', {
  state: () => ({
    templates: [] as IProjectHeader[],
    projectData: null as IProjectDataDB | null,

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

    // Nuevos getters para permisos de edición
    canEdit(): boolean {
      const authStore = useAuthStore()

      // Si no hay proyecto cargado, no puede editar
      if (!this.projectData) {
        return false
      }

      // Si no hay usuario logueado, no puede editar (solo visualizar)
      if (!authStore.isAuthenticated || !authStore.user) {
        return false
      }

      const projectId = this.projectData.id
      const user = authStore.user

      // Admin puede editar cualquier proyecto
      if (user.role === 'admin') {
        return true
      }

      // Proyectos temporales (loaded, new, o con prefijo 'p') se pueden editar
      if (projectId === 'loaded' || projectId === 'new' || projectId.startsWith('p')) {
        return true
      }

      // Templates se pueden editar (para crear nuevos proyectos basados en ellos)
      if (projectId.startsWith('t')) {
        return true
      }

      // Para proyectos guardados en BD, verificar ownership
      if (this.projectData.ownerId) {
        // Obtener userId del token JWT (más confiable que user.id del frontend)
        let userIdFromToken = null
        if (authStore.token) {
          try {
            // Decodificar el token para obtener el userId
            const tokenPayload = JSON.parse(atob(authStore.token.split('.')[1]))
            userIdFromToken = tokenPayload.userId
          } catch (error) {
            console.error('Error decodificando token:', error)
          }
        }

        // Verificar ownership usando el userId del token (más confiable)
        const isOwner = this.projectData.ownerId === userIdFromToken
        return isOwner
      }

      // Si no tiene ownerId, es un proyecto no guardado, permitir edición
      return true
    },

    isReadOnly(): boolean {
      return !this.canEdit
    }
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
          console.log('✅ getTemplate - Datos del proyecto respuesta:', (response as { data: IProjectData }).data)

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
          this.showSuccess('Proyecto Creado', 'Se ha creado un nuevo proyecto exitosamente')
        }
      } catch (error) {
        console.error('❌ Error creating new project:', error)
        this.setError('Error al crear nuevo proyecto')
        this.showError('Error al Crear', 'No se pudo crear el nuevo proyecto')
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


      try {
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'changeOrder',
            data: { itemId, sense }
          }
        })

        if ((response as { success: boolean }).success) {
          this.updateProjectDataPreservingMetadata((response as { data: IProjectData }).data)
          console.log('✅ changeOrder - Orden actualizada. Nuevo proyecto:', this.projectData?.items.map(item => item.id))
        }
      } catch (error) {
        console.error('❌ Error changing item order:', error)
        this.setError('Error al reordenar el ítem')
        this.showError('Error al Reordenar', 'No se pudo cambiar el orden del ítem')
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
          this.updateProjectDataPreservingMetadata((response as { data: IProjectData }).data)
          console.log('✅ Fechas reseteadas:', this.projectData?.items.map(item => ({ id: item.id, startDate: item.startDate })))
          this.showSuccess('Fechas Reseteadas', 'Las fechas manuales han sido reseteadas exitosamente')
        }
      } catch (error) {
        console.error('❌ Error resetting actual start dates:', error)
        this.setError('Error al resetear fechas')
        this.showError('Error al Resetear', 'No se pudieron resetear las fechas manuales')
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



          console.log('✅ Proyecto cargado desde archivo:', this.projectData?.title)
          this.showSuccess('Proyecto Cargado', `El proyecto "${this.projectData?.title}" se ha cargado correctamente`)
        }
      } catch (error) {
        console.error('❌ Error loading project from file:', error)
        this.setError('Error al cargar el archivo del proyecto')
        this.showError('Error al Cargar', 'No se pudo cargar el proyecto desde el archivo')
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
          this.showSuccess('Título Guardado', 'El título del proyecto se ha actualizado correctamente')
        }
      } catch (error) {
        console.error('❌ Error saving title:', error)
        this.setError('Error al guardar el título')
        this.showError('Error al Guardar', 'No se pudo guardar el título del proyecto')
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
          this.updateProjectDataPreservingMetadata((response as { data: IProjectData }).data)
          console.log('✅ Fecha de inicio cambiada. Nueva fecha:', this.projectData?.startDate)
          this.showSuccess('Fecha Actualizada', 'La fecha de inicio del proyecto se ha actualizado correctamente')
        } else {
          console.log('❌ Respuesta no exitosa al cambiar fecha')
          this.showError('Error de Fecha', 'No se pudo actualizar la fecha de inicio del proyecto')
        }
      } catch (error) {
        console.error('❌ Error changing start date:', error)
        this.setError('Error al cambiar la fecha de inicio')
        this.showError('Error de Conexión', 'No se pudo conectar con el servidor para cambiar la fecha')
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
          this.updateProjectDataPreservingMetadata((response as { data: IProjectData }).data)
          console.log('✅ Ítem añadido. Total de ítems:', this.projectData?.items.length)
          this.showSuccess('Ítem Añadido', 'El nuevo ítem se ha agregado al proyecto exitosamente')
        }
      } catch (error) {
        console.error('❌ Error adding new item:', error)
        this.setError('Error al agregar el ítem')
        this.showError('Error al Agregar', 'No se pudo agregar el nuevo ítem al proyecto')
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
          this.updateProjectDataPreservingMetadata((response as { data: IProjectData }).data)
          console.log('✅ Ítem editado:', this.projectData?.items.find(item => item.id === data.id)?.name)
          this.showSuccess('Ítem Editado', 'Los cambios se han guardado correctamente')
        }
      } catch (error) {
        console.error('❌ Error editing item:', error)
        this.setError('Error al editar el ítem')
        this.showError('Error al Editar', 'No se pudieron guardar los cambios del ítem')
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
          this.updateProjectDataPreservingMetadata((response as { data: IProjectData }).data)
          console.log('✅ Ítem eliminado. Total de ítems restantes:', this.projectData?.items.length)
          this.showSuccess('Ítem Eliminado', 'El ítem se ha eliminado del proyecto exitosamente')
          this.itemToDelete = null
        }
      } catch (error) {
        console.error('❌ Error deleting item:', error)
        this.setError('Error al eliminar el ítem')
        this.showError('Error al Eliminar', 'No se pudo eliminar el ítem del proyecto')
      } finally {
        this.setLoading(false)
      }
    },

    async saveProject() {
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
      this.showSuccess('Proyecto Guardado', 'El archivo del proyecto se ha descargado correctamente')
    },



    setupItemForEdit(item: IItemData | null) {
      this.itemToEdit = item;

    },

    setupItemForDelete(item: IItemData | null) {
      this.itemToDelete = item;

    },

    async exportPDF() {
      try {
        // Emitir evento para que el componente PDF se active
        if (import.meta.client) {
          window.dispatchEvent(new CustomEvent('generate-pdf'))
        }

        this.showSuccess('PDF', 'Generando reporte...')
      } catch (error) {
        console.error('Error al generar PDF:', error)
        this.showError('Error', 'Error al generar PDF')
      }
    },



    // Métodos de Toast helper
    showSuccess(title: string, message: string) {
      const { showSuccess } = useToast()
      return showSuccess(title, message)
    },

    showError(title: string, message: string) {
      const { showError } = useToast()
      return showError(title, message)
    },

    showWarning(title: string, message: string) {
      const { showWarning } = useToast()
      return showWarning(title, message)
    },

    // Helper para preservar metadatos al actualizar projectData
    updateProjectDataPreservingMetadata(newData: IProjectData) {
      if (!this.projectData) {
        this.projectData = newData
        return
      }

      // Si el proyecto actual tiene un ID de MongoDB, preservar metadatos
      const isCurrentProjectFromDB = /^[0-9a-fA-F]{24}$/.test(this.projectData.id)

      if (isCurrentProjectFromDB) {
        // Preservar metadatos de BD
        const metadata = {
          id: this.projectData.id, // Mantener el ID de MongoDB
          _id: this.projectData._id,
          ownerId: this.projectData.ownerId,
          isPublic: this.projectData.isPublic,
          isTemplate: this.projectData.isTemplate,
          createdAt: this.projectData.createdAt,
          updatedAt: this.projectData.updatedAt
        }

        // Actualizar con nuevos datos
        this.projectData = { ...newData, ...metadata }
      } else {
        // Proyecto temporal, actualizar normalmente
        this.projectData = newData
      }
    },

    // Nuevos métodos para el sistema de base de datos
    async loadProjectById(projectId: string) {
      this.setLoading(true)
      this.setError(null)

      const authStore = useAuthStore()

      try {
        const headers: Record<string, string> = {}

        // Agregar token si está disponible (para proyectos privados)
        if (authStore.isAuthenticated && authStore.token) {
          headers['Authorization'] = `Bearer ${authStore.token}`
        }

        const response = await $fetch(`/api/projects/${projectId}`, {
          headers
        })

        if ((response as any).project) {
          this.projectData = (response as any).project
          console.log('✅ Proyecto cargado desde BD:', this.projectData?.title)

          // 🔧 SINCRONIZAR con el ProjectController del servidor
          // Preservar metadatos importantes antes de sincronizar
          const originalMetadata = {
            _id: this.projectData._id,
            ownerId: this.projectData.ownerId,
            isPublic: this.projectData.isPublic,
            isTemplate: this.projectData.isTemplate,
            createdAt: this.projectData.createdAt,
            updatedAt: this.projectData.updatedAt
          }

          try {
            await $fetch('/api/project', {
              method: 'POST',
              body: {
                action: 'loadFromFile',
                data: { jsonData: this.projectData }
              }
            })
            console.log('✅ Proyecto sincronizado con el servidor')

            // Restaurar metadatos después de la sincronización
            Object.assign(this.projectData, originalMetadata)
          } catch (syncError) {
            console.error('⚠️ Error sincronizando con servidor:', syncError)
            // No lanzar error, el proyecto se cargó correctamente en el frontend
          }

          this.showSuccess('Proyecto Cargado', `Proyecto "${this.projectData?.title}" cargado exitosamente`)
        } else {
          throw new Error('Proyecto no encontrado')
        }
      } catch (error: any) {
        console.error('❌ Error loading project from DB:', error)

        if (error.statusCode === 401) {
          this.showError('No Autorizado', 'Este proyecto requiere autenticación')
        } else if (error.statusCode === 404) {
          this.showError('No Encontrado', 'El proyecto no existe o no tienes acceso')
        }

        throw error // Re-lanzar para que el componente pueda manejarlo
      } finally {
        this.setLoading(false)
      }
    },

    async createTemporaryProject(projectId: string) {
      console.log('🔄 Creando proyecto temporal con ID:', projectId)
      this.setLoading(true)
      this.setError(null)

      try {
        // Crear un proyecto temporal usando la API existente
        const response = await $fetch('/api/project', {
          method: 'POST',
          body: {
            action: 'newProject',
            data: { startDate: formatDateToDisplay(new Date()) }
          }
        })

        if ((response as { success: boolean }).success) {
          this.projectData = (response as { data: IProjectData }).data

          // Cambiar el ID al solicitado
          if (this.projectData) {
            this.projectData.id = projectId
          }

          console.log('✅ Proyecto temporal creado:', this.projectData?.title)
          this.showInfo(
            'Proyecto Temporal',
            'Se ha creado un borrador temporal. Guárdalo para que aparezca en tu lista de proyectos.'
          )
        }
      } catch (error) {
        console.error('❌ Error creating temporary project:', error)
        this.setError('Error al crear proyecto temporal')
        this.showError('Error', 'No se pudo crear el proyecto temporal')
      } finally {
        this.setLoading(false)
      }
    },

    async saveToDatabase(isPublic = false, isTemplate = false) {
      if (!this.projectData) {
        this.showError('Error', 'No hay proyecto para guardar')
        return false
      }

      const authStore = useAuthStore()
      if (!authStore.isAuthenticated || !authStore.token) {
        this.showError('No Autorizado', 'Debes iniciar sesión para guardar proyectos')
        return false
      }

      // Detectar si es un proyecto existente basado en el ID
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(this.projectData.id)
      const isExistingProject = isMongoId && this.projectData.ownerId



      if (isExistingProject) {
        // Verificar si el usuario es el propietario o admin
        // Usar el mismo método que canEdit para obtener userId del token
        let userIdFromToken = null
        if (authStore.token) {
          try {
            const tokenPayload = JSON.parse(atob(authStore.token.split('.')[1]))
            userIdFromToken = tokenPayload.userId
          } catch (error) {
            console.error('Error decodificando token:', error)
          }
        }

        const isOwner = this.projectData.ownerId === userIdFromToken
        const isAdmin = authStore.user?.role === 'admin'

        let confirmMessage = ''
        if (isOwner) {
          confirmMessage = `¿Estás seguro de que quieres actualizar el proyecto "${this.projectData.title}"?\n\nEsta acción sobrescribirá la versión guardada en la base de datos con los cambios actuales.`
        } else if (isAdmin) {
          confirmMessage = `⚠️ ADMINISTRADOR: Estás modificando un proyecto que no es tuyo.\n\nProyecto: "${this.projectData.title}"\nPropietario: ${this.projectData.ownerId}\n\n¿Estás seguro de que quieres actualizar este proyecto como administrador?`
        } else {
          this.showError('Sin Permisos', 'No tienes permisos para modificar este proyecto')
          return false
        }
        // Usar modal de confirmación en lugar de confirm()
        return new Promise((resolve) => {
          const { openConfirmModal } = useUIStore()

          openConfirmModal({
            title: isAdmin && !isOwner ? 'Confirmar Modificación como Administrador' : 'Confirmar Actualización',
            message: confirmMessage,
            type: isAdmin && !isOwner ? 'warning' : 'info',
            confirmText: 'Actualizar Proyecto',
            onConfirm: () => {
              this.performSaveToDatabase(isPublic, isTemplate, isExistingProject).then(resolve)
            }
          })
        })
      } else {
        // Proyecto nuevo, proceder directamente
        return this.performSaveToDatabase(isPublic, isTemplate, isExistingProject)
      }
    },

    async performSaveToDatabase(isPublic = false, isTemplate = false, isExistingProject = false) {
      console.log('🔄 Guardando proyecto:', this.projectData?.title)

      const authStore = useAuthStore()
      this.setLoading(true)
      this.setError(null)

      try {
        // Excluir criticalPaths al guardar (se calculan dinámicamente)
        const { criticalPaths, ...projectDataToSave } = this.projectData


        const response = await $fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: {
            projectData: projectDataToSave,
            isPublic,
            isTemplate
          }
        })

        if ((response as any).success) {
          const savedProject = (response as any).project
          console.log('✅ Proyecto guardado:', savedProject.id)

          // Actualizar el projectData con el ID de MongoDB si es un proyecto nuevo
          if (savedProject.id && !isExistingProject) {
            this.projectData.id = savedProject.id
            this.projectData._id = savedProject.id
            this.projectData.ownerId = savedProject.ownerId
          }

          const actionText = isExistingProject ? 'actualizado' : 'guardado'
          this.showSuccess(
            `Proyecto ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
            (response as any).message || `El proyecto se ha ${actionText} correctamente en la base de datos`
          )
          return savedProject
        } else {
          throw new Error('Respuesta no exitosa del servidor')
        }
      } catch (error: any) {
        console.error('❌ Error saving project to database:', error)

        if (error.statusCode === 401) {
          this.showError('No Autorizado', 'Tu sesión ha expirado. Inicia sesión nuevamente')
          authStore.logout()
        } else if (error.statusCode === 403) {
          this.showError('Sin Permisos', 'No tienes permisos para modificar este proyecto')
        } else {
          this.showError('Error al Guardar', 'No se pudo guardar el proyecto en la base de datos')
        }
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async getUserProjects() {
      console.log('🔄 Obteniendo proyectos del usuario')
      this.setLoading(true)
      this.setError(null)

      const authStore = useAuthStore()
      if (!authStore.isAuthenticated || !authStore.token) {
        this.showError('No Autorizado', 'Debes iniciar sesión para ver tus proyectos')
        return []
      }

      try {
        const response = await $fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        if ((response as any).success) {
          console.log('✅ Proyectos obtenidos:', (response as any).projects.length)
          return (response as any).projects
        } else {
          throw new Error('Respuesta no exitosa del servidor')
        }
      } catch (error: any) {
        console.error('❌ Error getting user projects:', error)

        if (error.statusCode === 401) {
          this.showError('No Autorizado', 'Tu sesión ha expirado. Inicia sesión nuevamente')
          authStore.logout()
        } else {
          this.showError('Error', 'No se pudieron obtener los proyectos')
        }
        return []
      } finally {
        this.setLoading(false)
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