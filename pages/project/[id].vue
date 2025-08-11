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
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '../../stores/project'
import { useUIStore } from '../../stores/ui'

const route = useRoute()
const projectStore = useProjectStore()
const uiStore = useUIStore()

// Obtener el ID del proyecto desde la ruta
const tempId = route.params.id as string

onMounted(async () => {
  try {
    // La lógica de carga de proyecto se ha movido al `onMounted`
    // para asegurar que el store esté listo.
    await projectStore.getTemplate(tempId)
  } catch (error) {
    console.error('Error al inicializar el proyecto:', error)
    projectStore.newProject()
  }
})

</script>