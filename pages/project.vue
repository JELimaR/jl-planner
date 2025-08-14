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
    <ProjectSpending />

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { onBeforeRouteLeave } from 'nuxt/app';
import { useProjectStore } from '../stores/project'
import { useUIStore } from '../stores/ui'

const projectStore = useProjectStore()
const uiStore = useUIStore()

onMounted(async () => {
  try {
    // Solo inicializa el proyecto si no se ha hecho antes
    if (!projectStore.isInitialized) {
      await projectStore.getTemplate('t000')
    }
  } catch (error) {
    console.error('Error al inicializar el proyecto:', error)
    projectStore.newProject()
  }
})

onBeforeRouteLeave((to, from, next) => {
  if (to.path !== from.path) {
    projectStore.projectData = null;
  }
  next();
});

</script>