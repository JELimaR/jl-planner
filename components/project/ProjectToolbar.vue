<template>
  <div class="container my-3">
    <div class="toolbar-container">
      <!-- Sección de Estado -->
      <div class="toolbar-section">
        <div class="badge" :class="projectStore.canEdit ? 'bg-success' : 'bg-warning'" v-html="getEditModeText()">
        </div>
      </div>

      <!-- Sección de Edición del Proyecto -->
      <div v-if="projectStore.canEdit" class="toolbar-section">
        <label class="toolbar-label">Proyecto:</label>
        <div class="btn-group" role="group">
          <button class="btn btn-outline-secondary btn-sm" @click="openEditTitleModal"
            title="Editar título y subtítulo">
            <i class="bi bi-pencil me-1"></i>Editar Título
          </button>
          <button class="btn btn-outline-danger btn-sm" @click="createNewProject" title="Crear nuevo proyecto">
            <i class="bi bi-plus-circle me-1"></i>Nuevo
          </button>
        </div>
      </div>

      <!-- Sección de Archivos -->
      <div class="toolbar-section">
        <label class="toolbar-label">Archivos:</label>
        <div class="btn-group" role="group">
          <ProjectLoader />
          <button class="btn btn-outline-secondary btn-sm" @click="projectStore.saveProject()"
            title="Descargar proyecto como JSON">
            <i class="bi bi-download me-1"></i>Descargar
          </button>
        </div>
      </div>

      <!-- Sección de Base de Datos -->
      <div v-if="authStore.isAuthenticated" class="toolbar-section">
        <label class="toolbar-label">Base de Datos:</label>
        <div class="btn-group" role="group">
          <button v-if="projectStore.canEdit" class="btn btn-outline-success btn-sm" @click="saveToDatabase"
            title="Guardar en base de datos">
            <i class="bi bi-save me-1"></i>Guardar
          </button>
          <button v-if="canTogglePublic"
            :class="['btn', 'btn-sm', projectStore.projectData?.isPublic ? 'btn-outline-warning' : 'btn-outline-info']"
            @click="toggleProjectPublic"
            :title="projectStore.projectData?.isPublic ? 'Marcar como privado' : 'Marcar como público'">
            <i :class="projectStore.projectData?.isPublic ? 'bi bi-lock' : 'bi bi-globe'"></i>
            {{ projectStore.projectData?.isPublic ? 'Privado' : 'Público' }}
          </button>
          <button v-if="canDeleteProject" class="btn btn-outline-danger btn-sm" @click="deleteProject"
            title="Eliminar proyecto de la base de datos">
            <i class="bi bi-trash me-1"></i>Eliminar
          </button>
        </div>
      </div>

      <!-- Sección de Exportación -->
      <div class="toolbar-section">
        <label class="toolbar-label">Exportar:</label>
        <button class="btn btn-outline-primary btn-sm" @click="projectStore.exportPDF()"
          title="Generar PDF del proyecto">
          <i class="bi bi-file-earmark-pdf me-1"></i>PDF
        </button>
      </div>

      <!-- Sección de Fechas -->
      <div class="toolbar-section">
        <label class="toolbar-label">Fechas:</label>
        <div class="dates-container">
          <!-- Mostrar fechas del proyecto -->
          <div class="project-dates">
            <div><strong>Inicio del proyecto: </strong><span>{{ projectStore.projectStartDate }}</span></div>
            <div><strong>Final del proyecto: </strong><span>{{ projectStore.projectEndDate }}</span></div>
          </div>

          <!-- Controles de edición (solo si puede editar) -->
          <div v-if="projectStore.canEdit" class="date-controls">
            <div class="d-flex align-items-center gap-2">
              <DateInput v-model="selectedDate" />
              <button class="btn btn-outline-primary btn-sm btn-compact" @click="changeStartDate"
                title="Cambiar fecha de inicio">
                <i class="bi bi-calendar-event"></i>
              </button>
              <button class="btn btn-outline-warning btn-sm btn-compact" @click="projectStore.resetActualStartDates()"
                title="Resetear fechas manuales de ítems">
                <i class="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para editar título -->
    <VueFinalModal :model-value="editTitleModalVisible" :lock-scroll="true" :teleport-to="'body'"
      overlay-class="modal-overlay" content-class="modal-content" @closed="closeEditTitleModal">
      <div class="modal-header">
        <h5 class="modal-title">Editar Título del Proyecto</h5>
        <button type="button" class="btn-close" aria-label="Close" @click="closeEditTitleModal"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label for="project-title-input" class="form-label">Título del proyecto</label>
          <input type="text" class="form-control" id="project-title-input" v-model="editTitle"
            placeholder="Ingrese el título del proyecto" />
        </div>
        <div class="mb-3">
          <label for="project-subtitle-input" class="form-label">Subtítulo (opcional)</label>
          <input type="text" class="form-control" id="project-subtitle-input" v-model="editSubtitle"
            placeholder="Ingrese el subtítulo del proyecto" />
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeEditTitleModal">
          Cancelar
        </button>
        <button type="button" class="btn btn-primary" @click="saveTitleFromToolbar">
          Guardar
        </button>
      </div>
    </VueFinalModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TDateString } from '../../src/models/dateFunc';
import { useProjectStore } from '../../stores/project'
import { useAuthStore } from '../../stores/auth'
import { useUIStore } from '../../stores/ui'
import { useToast } from '../../composables/useToast'
import { navigateTo } from 'nuxt/app'
import DateInput from '../DateInput.vue'
import { VueFinalModal } from 'vue-final-modal'

const selectedDate = ref<TDateString | undefined>(undefined);

const projectStore = useProjectStore()
const authStore = useAuthStore()
const uiStore = useUIStore()
const { showWarning, showSuccess, showError } = useToast()

// Estado para el modal de edición de título
const editTitleModalVisible = ref(false)
const editTitle = ref('')
const editSubtitle = ref('')

// Computed para determinar si puede cambiar el estado público
const canTogglePublic = computed(() => {
  if (!authStore.isAuthenticated || !projectStore.projectData) {
    return false
  }

  // Solo si el proyecto está guardado en BD (tiene ownerId)
  if (!projectStore.projectData.ownerId) {
    return false
  }

  const user = authStore.user
  if (!user) return false

  // Admin puede cambiar cualquier proyecto
  if (user.role === 'admin') {
    return true
  }

  // Propietario puede cambiar su proyecto
  return projectStore.projectData.ownerId === user.id
})

// Computed para determinar si puede eliminar el proyecto
const canDeleteProject = computed(() => {
  if (!authStore.isAuthenticated || !projectStore.projectData) {
    return false
  }

  // Solo si el proyecto está guardado en BD (tiene ownerId)
  if (!projectStore.projectData.ownerId) {
    return false
  }

  const user = authStore.user
  if (!user) return false

  // Obtener userId del token para comparación consistente
  let userIdFromToken = null
  if (authStore.token) {
    try {
      const tokenPayload = JSON.parse(atob(authStore.token.split('.')[1]))
      userIdFromToken = tokenPayload.userId
    } catch (error) {
      console.error('Error decodificando token:', error)
      return false
    }
  }

  // Admin puede eliminar cualquier proyecto
  if (user.role === 'admin') {
    return true
  }

  // Propietario puede eliminar su proyecto
  return projectStore.projectData.ownerId === userIdFromToken
})

const createNewProject = () => {
  // Navegar a /project/new para crear un nuevo proyecto
  navigateTo('/project/new')
}

const changeStartDate = async () => {
  if (selectedDate.value) {
    await projectStore.changeStartDate(selectedDate.value)
    // Limpiar el input después de cambiar la fecha
    selectedDate.value = undefined
  } else {
    // Mostrar toast de advertencia cuando no hay fecha seleccionada
    showWarning('Fecha Requerida', 'Por favor selecciona una fecha antes de cambiar el inicio del proyecto')
  }
}

const getEditModeText = () => {
  if (!authStore.isAuthenticated) {
    return '<i class="bi bi-lock me-1"></i>No Autenticado'
  }

  if (!projectStore.projectData) {
    return '<i class="bi bi-question-circle me-1"></i>Sin Proyecto'
  }

  if (projectStore.canEdit) {
    return '<i class="bi bi-pencil me-1"></i>Modo Edición'
  }

  // Verificar por qué no puede editar
  if (projectStore.projectData.ownerId && authStore.user) {
    if (authStore.user.role === 'admin') {
      return '<i class="bi bi-shield-check me-1"></i>Admin - Edición'
    } else if (projectStore.projectData.ownerId !== authStore.user.id) {
      return '<i class="bi bi-eye me-1"></i>Solo Lectura'
    }
  }

  return '<i class="bi bi-eye me-1"></i>Solo Lectura'
}

const saveToDatabase = async () => {
  if (!projectStore.projectData) {
    showError('Error', 'No hay proyecto para guardar')
    return
  }



  // Verificar que el proyecto tenga título
  if (!projectStore.projectData.title || projectStore.projectData.title.trim() === '') {
    showWarning('Título Requerido', 'El proyecto debe tener un título antes de guardarlo')
    return
  }

  const isExistingProject = !!(projectStore.projectData._id || projectStore.projectData.ownerId)
  const savedProject = await projectStore.saveToDatabase()

  if (savedProject) {
    // Solo navegar si es un proyecto nuevo, si es actualización quedarse en la misma página
    if (!isExistingProject) {
      console.log('🔄 Navegando al proyecto guardado:', savedProject.id)
      await navigateTo(`/project/${savedProject.id}`)
    } else {
      console.log('✅ Proyecto actualizado, permaneciendo en la página actual')
    }
  }
}

const toggleProjectPublic = async () => {
  if (!projectStore.projectData || !authStore.user) {
    showError('Error', 'No se puede cambiar el estado del proyecto')
    return
  }

  const currentState = projectStore.projectData.isPublic
  const newState = !currentState
  const action = newState ? 'público' : 'privado'

  // Usar modal de confirmación en lugar de confirm()
  const uiStore = useUIStore()

  uiStore.openConfirmModal({
    title: 'Cambiar Visibilidad del Proyecto',
    message: `¿Marcar este proyecto como ${action}?`,
    details: newState
      ? 'El proyecto será visible para todos los usuarios.'
      : 'El proyecto solo será visible para ti.',
    type: 'warning',
    confirmText: `Marcar como ${action}`,
    onConfirm: () => performTogglePublic(newState)
  })
}

const performTogglePublic = async (newState: boolean) => {
  if (!projectStore.projectData || !authStore.user) {
    showError('Error', 'No se puede cambiar el estado del proyecto')
    return
  }

  try {
    const response = await $fetch('/api/admin/toggle-project-public', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      body: {
        projectId: projectStore.projectData._id || projectStore.projectData.id,
        isPublic: newState
      }
    })

    if ((response as any).success) {
      // Actualizar el estado local
      if (projectStore.projectData) {
        projectStore.projectData.isPublic = newState
      }

      showSuccess(
        'Estado Actualizado',
        `Proyecto marcado como ${newState ? 'público' : 'privado'}`
      )
    }
  } catch (error: any) {
    console.error('❌ Error cambiando estado público:', error)

    if (error.statusCode === 403) {
      showError('Sin Permisos', 'No tienes permisos para cambiar este proyecto')
    } else {
      showError('Error', 'No se pudo cambiar el estado del proyecto')
    }
  }
}

// Funciones para el modal de edición de título
const openEditTitleModal = () => {
  editTitle.value = projectStore.projectTitle
  editSubtitle.value = projectStore.projectSubtitle
  editTitleModalVisible.value = true
}

const closeEditTitleModal = () => {
  editTitleModalVisible.value = false
}

const saveTitleFromToolbar = () => {
  projectStore.saveTitle(editTitle.value, editSubtitle.value)
  closeEditTitleModal()
}

// Función para eliminar proyecto
const deleteProject = () => {
  if (!projectStore.projectData || !authStore.user) {
    showError('Error', 'No se puede eliminar el proyecto')
    return
  }

  // Obtener userId del token para verificación
  let userIdFromToken = null
  if (authStore.token) {
    try {
      const tokenPayload = JSON.parse(atob(authStore.token.split('.')[1]))
      userIdFromToken = tokenPayload.userId
    } catch (error) {
      console.error('Error decodificando token:', error)
      showError('Error', 'Error de autenticación')
      return
    }
  }

  const isOwner = projectStore.projectData.ownerId === userIdFromToken
  const isAdmin = authStore.user.role === 'admin'

  let confirmMessage = ''
  let confirmDetails = ''

  if (isOwner) {
    confirmMessage = `¿Estás seguro de que quieres eliminar el proyecto "${projectStore.projectData.title}"?`
    confirmDetails = 'Esta acción no se puede deshacer. El proyecto se descargará automáticamente antes de eliminarse.'
  } else if (isAdmin) {
    confirmMessage = `ADMINISTRADOR: Vas a eliminar un proyecto que no es tuyo.`
    confirmDetails = `Proyecto: "${projectStore.projectData.title}"<br>Propietario: ${projectStore.projectData.ownerId}<br><br>Esta acción no se puede deshacer. El proyecto se descargará automáticamente antes de eliminarse.`
  }

  uiStore.openConfirmModal({
    title: 'Eliminar Proyecto',
    message: confirmMessage,
    details: confirmDetails,
    type: 'danger',
    confirmText: 'Eliminar Proyecto',
    cancelText: 'Cancelar',
    onConfirm: () => performDeleteProject()
  })
}

const performDeleteProject = async () => {
  if (!projectStore.projectData) return

  try {
    // Primero descargar el proyecto como respaldo
    await projectStore.saveProject()

    // Luego eliminar de la base de datos
    const response = await $fetch(`/api/projects/${projectStore.projectData.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if ((response as any).success) {
      showSuccess('Proyecto Eliminado', 'El proyecto ha sido eliminado correctamente. Se ha descargado una copia de respaldo.')

      // Navegar a la página principal
      await navigateTo('/')
    }
  } catch (error: any) {
    console.error('❌ Error eliminando proyecto:', error)

    if (error.statusCode === 403) {
      showError('Sin Permisos', 'No tienes permisos para eliminar este proyecto')
    } else if (error.statusCode === 404) {
      showError('No Encontrado', 'El proyecto no existe o ya fue eliminado')
    } else {
      showError('Error', 'No se pudo eliminar el proyecto')
    }
  }
}





</script>

<style scoped>
.toolbar-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: fit-content;
}

.toolbar-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-group .btn {
  border-radius: 0;
}

.btn-group .btn:first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.btn-group .btn:last-child {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .toolbar-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .toolbar-section {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .toolbar-label {
    min-width: 80px;
  }
}

/* Modal styles */
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-close {
  cursor: pointer;
  border: none;
  background: transparent;
  font-size: 1.5rem;
}

/* Estilos para la sección de fechas */
.dates-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.project-dates {
  padding: 0.5rem;
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
}

.project-dates div {
  margin-bottom: 0.25rem;
}

.project-dates div:last-child {
  margin-bottom: 0;
}

.date-controls {
  border-top: 1px solid #e9ecef;
  padding-top: 0.5rem;
}

/* Estilos compactos para controles de fecha */
.date-controls .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  min-width: auto;
}

.btn-compact {
  padding: 0.2rem 0.4rem !important;
  font-size: 0.8rem !important;
  min-width: 32px !important;
  width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-controls :deep(.date-input) {
  max-width: 120px;
  font-size: 0.8rem;
}

.date-controls :deep(.date-input input) {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  height: auto;
}

/* Responsive para fechas */
@media (max-width: 768px) {
  .dates-container {
    width: 100%;
  }

  .date-controls .d-flex {
    flex-wrap: wrap;
  }

  .date-controls .btn {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
}
</style>