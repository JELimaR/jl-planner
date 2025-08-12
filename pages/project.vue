<template>
  <div>
    <!-- Header del proyecto -->
    <ProjectHeader />

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

    <!-- {{ projectStore.controller.calculateDailySpending('linear') }} -->

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useProjectStore } from '../stores/project'
import { useUIStore } from '../stores/ui'

const projectStore = useProjectStore()
const uiStore = useUIStore()

onMounted(async () => {
  try {
    // Si no hay proyecto cargado, crear uno vacío
    if (!projectStore.projectData) {
      await projectStore.newProject()
    }
  } catch (error) {
    console.error('Error al inicializar el proyecto:', error)
    projectStore.newProject()
  }
})

</script>