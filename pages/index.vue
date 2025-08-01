<template>
  <div>
    <!-- Barra de acciones del proyecto -->
    <ProjectToolbar />

    <!-- Fechas del proyecto -->
    <ProjectDates />

    <!-- Tabla de tareas -->
    <TaskTable />

    <!-- Modal: Agregar -->
    <AddItemModal />

    <!-- Modal: Eliminar -->
    <DeleteModal />

    <div class="page-break"></div>
    
    <!-- Diagrama de Gantt -->
    <GanttChart />

    <div class="page-break"></div>
    
    <!-- Caminos críticos -->
    <CriticalPaths />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useProjectStore } from '../stores/project'
import { useUIStore } from '../stores/ui'
import { setProjectItemsColors } from '../src/views/colors'

const projectStore = useProjectStore()
const uiStore = useUIStore()

onMounted(async () => {
  // Inicializar el proyecto
  await projectStore.initializeProject()
  
  // Configurar eventos globales si es necesario
  if (typeof window !== 'undefined') {
    window.addEventListener('openDeleteModal', (e: any) => {
      projectStore.itemToDelete = e.detail.itemId
      uiStore.openDeleteModal()
    })
  }
})

// Escuchar eventos de renderizado global
watch(() => [projectStore.projectStartDate, projectStore.projectEndDate], () => {
  // Actualizar la interfaz cuando cambien las fechas del proyecto
  setProjectItemsColors(projectStore.controller.getProject())
})
</script>