<template>
  <div>
    <!-- Barra de acciones del proyecto -->
    <div class="container my-3">
      <div class="d-flex flex-wrap align-items-center gap-2">
        <!-- Proyecto -->
        <button id="new-project-button" class="btn btn-outline-danger btn-sm" @click="newProject">
          🆕 Nuevo proyecto
        </button>
        <button
          id="reset-actual-start-dates"
          class="btn btn-outline-danger btn-sm"
          @click="resetActualStartDates"
        >
          🔄 Reset fechas manuales
        </button>

        <!-- Cargar / Guardar -->
        <button
          id="load-project-button"
          class="btn btn-outline-secondary btn-sm"
          @click="loadProject"
        >
          📂 Cargar
        </button>
        <button
          id="save-project-button"
          class="btn btn-outline-secondary btn-sm"
          @click="saveProject"
        >
          💾 Guardar
        </button>

        <!-- Cambiar fecha de inicio -->
        <div class="d-flex align-items-center mx-5">
          <input
            type="date"
            id="new-start-date-input"
            class="form-control form-control-sm ms-2"
            v-model="newStartDate"
          />
          <button
            id="change-start-date-button"
            class="btn btn-outline-primary btn-sm ms-2"
            @click="changeStartDate"
          >
            Cambiar inicio
          </button>
        </div>

        <!-- exportar -->
        <button id="export-pdf-button" class="btn btn-outline-primary btn-sm" @click="exportPDF">
          🖨️ Imprimir Informe
        </button>
      </div>

      <!-- Input oculto para cargar archivos -->
      <input
        type="file"
        id="load-project-file"
        accept=".json"
        style="display: none"
        ref="fileInput"
        @change="handleFileLoad"
      />
    </div>

    <!-- Fechas del proyecto -->
    <div class="container mb-3">
      <div>
        <strong>Inicio del proyecto:</strong>
        <span id="start-date-value">{{ formatDate(projectStartDate) }}</span>
      </div>
      <div>
        <strong>Final del proyecto:</strong>
        <span id="end-date-value">{{ formatDate(projectEndDate) }}</span>
      </div>
    </div>

    <!-- Tabla de tareas -->
    <div id="task-table-container" class="container">
      <h2 class="mb-3">Tabla de Tareas</h2>
      <div class="custom_table_wrapper table-responsive">
        <table class="custom_table">
          <thead>
            <tr>
              <th style="width: 5%">ID</th>
              <th style="width: 19%">Nombre</th>
              <th style="width: 19%">Detalle</th>
              <th style="width: 7%">Duración</th>
              <th style="width: 15%">Inicio</th>
              <th style="width: 15%">Fin</th>
              <th style="width: 10%">Dependencias</th>
              <th style="width: 10%"></th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>

      <!-- Botón Agregar -->
      <div id="add-item-container" class="my-3">
        <button id="add-item-button" class="btn btn-success" @click="openAddModal">
          ➕ Agregar Item
        </button>
      </div>
    </div>

    <!-- Modal: Agregar -->
    <div id="addModal" class="modal fade" tabindex="-1" ref="addModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar' : 'Agregar' }} Item</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="closeAddModal"></button>
          </div>
          <div class="modal-body">
            <form id="addForm"></form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Eliminar -->
    <div id="deleteModal" class="modal fade" tabindex="-1" ref="deleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Eliminar Item</h5>
            <button class="btn-close" aria-label="Close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de eliminar este item?</p>
            <button
              type="button"
              id="delete-confirm"
              class="btn btn-sm btn-danger"
              @click="confirmDelete"
            >
              Sí, eliminar
            </button>
            <button
              type="button"
              id="delete-cancel"
              class="btn btn-sm btn-secondary"
              @click="closeDeleteModal"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="page-break"></div>
    <!-- Diagrama de Gantt -->
    <div id="gantt" class="p-3">
      <h2 class="mb-3">Diagrama de Gantt</h2>
      <div class="selector mb-3">
        <label for="scale-selector" class="form-label me-2">Escala:</label>
        <select
          id="scale-selector"
          class="form-select w-auto d-inline-block"
          aria-label="Default select example"
          v-model="currentScale"
          @change="updateGanttScale"
        >
          <option value="day">Día</option>
          <option value="week">Semana</option>
          <option value="month">Mes</option>
        </select>
      </div>
      <div id="gantt-container" class="justify-content-center">
        <div id="gantt_here" class="justify-content-center"></div>
      </div>
    </div>

    <div class="page-break"></div>
    <!-- Caminos críticos -->
    <div id="critical-paths" class="container my-4"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { Scale } from '../src/views/ganttHelpers'
import { getFormItemValues, clearAddItemForm } from '../src/controllers/addItemValues'
import { useProjectController } from '../composables/useProjectController'
import { useNuxtApp } from 'nuxt/app'

// Reactive data
const projectStartDate = ref(new Date())
const projectEndDate = ref(new Date())
const newStartDate = ref('')
const currentScale = ref<Scale>('week')
const isEditing = ref(false)
const itemToDelete = ref<number | null>(null)

// Refs for modals
const addModal = ref<HTMLElement>()
const deleteModal = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()

// Modal instances
let addModalInstance: any = null
let deleteModalInstance: any = null

// Project controller composable
const { 
  controller, 
  initializeProject, 
  renderTable, 
  renderGantt, 
  renderCriticalPaths, 
  setupAddForm,
  setupDynamicItemButtons,
  addNewItem
} = useProjectController()

// Methods
const formatDate = (date: Date) => {
  return date.toLocaleDateString('es-ES')
}

const newProject = () => {
  if (controller) {
    controller.createNewProject(new Date())
    renderAll()
  }
}

const resetActualStartDates = () => {
  if (controller) {
    controller.resetActualStartDates()
    renderAll()
  }
}

const loadProject = () => {
  fileInput.value?.click()
}

const saveProject = () => {
  if (controller) {
    controller.downloadProjectAsJSON()
  }
}

const handleFileLoad = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && controller) {
    try {
      await controller.loadProjectFromFile(file)
      renderAll()
    } catch (error) {
      console.error('Error loading project:', error)
    }
  }
}

const changeStartDate = () => {
  if (newStartDate.value && controller) {
    controller.changeStartDate(new Date(newStartDate.value))
    renderAll()
  }
}

const exportPDF = () => {
  // Implementation for PDF export
  console.log('Export PDF functionality to be implemented')
}

const openAddModal = () => {
  isEditing.value = false
  nextTick(() => {
    setupAddForm()
    setupAddFormSubmit()
    addModalInstance?.show()
  })
}

const closeAddModal = () => {
  addModalInstance?.hide()
  clearAddItemForm(controller.getProject())
}

const openDeleteModal = (itemId: number) => {
  itemToDelete.value = itemId
  deleteModalInstance?.show()
}

const closeDeleteModal = () => {
  deleteModalInstance?.hide()
  itemToDelete.value = null
}

const confirmDelete = () => {
  if (itemToDelete.value && controller) {
    controller.deleteItem(itemToDelete.value)
    renderAll()
    closeDeleteModal()
  }
}

const updateGanttScale = () => {
  renderAll()
}

const setupAddFormSubmit = () => {
  const submitButton = document.getElementById('add-item-submit')
  if (submitButton) {
    submitButton.onclick = () => {
      if (isEditing.value) {
        // Edit logic is handled in the composable
      } else {
        addNewItem()
        closeAddModal()
        renderAll()
      }
    }
  }
}

const renderAll = () => {
  if (!controller) return
  
  // Update project dates
  const project = controller.getProject()
  projectStartDate.value = project.getProjectStartDate()
  projectEndDate.value = project.getProjectEndDate()
  
  nextTick(() => {
    // Update table content
    renderTable()
    
    // Update Gantt chart
    renderGantt(currentScale.value)
    
    // Update critical paths
    renderCriticalPaths()
  })
}

onMounted(async () => {
  // Check if code is running in browser environment
  // This is needed because some features only work in the browser, not during server-side rendering
  if (typeof window !== 'undefined') {
    // Initialize Bootstrap modals
    const { $bootstrap } = useNuxtApp()
    addModalInstance = ($bootstrap as any).Modal.getOrCreateInstance(addModal.value)
    deleteModalInstance = ($bootstrap as any).Modal.getOrCreateInstance(deleteModal.value)
    
    // Set initial date
    const today = new Date()
    newStartDate.value = today.toISOString().split('T')[0]
    
    // Initialize project controller and load default project
    await initializeProject()
    
    // Setup global event listeners
    window.addEventListener('openDeleteModal', (e: any) => {
      openDeleteModal(e.detail.itemId)
    })
    
    window.addEventListener('closeAddModal', () => {
      closeAddModal()
    })
    
    window.addEventListener('renderAll', () => {
      renderAll()
    })
    
    // Initial render
    await nextTick()
    renderAll()
  }
})
</script>