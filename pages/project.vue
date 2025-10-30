<template>
  <div class="container my-4">
    <div v-if="projectStore.projectData != null">
      <ProjectHeader />
      <ProjectToolbar />
      <ProjectDates />



      <div class="row mt-4">
        <div class="col-12 mb-3">
          <ul class="nav nav-tabs">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: currentView === 'details' }"
                @click.prevent="currentView = 'details'" href="#">
                Tabla de Tareas
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: currentView === 'ganttAndCriticalPaths' }"
                @click.prevent="currentView = 'ganttAndCriticalPaths'" href="#">
                Gantt & Caminos Críticos
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                :class="{ 
                  active: currentView === 'spending',
                  disabled: isSpendingDisabled
                }"
                @click.prevent="!isSpendingDisabled && (currentView = 'spending')" 
                href="#"
                :style="{ cursor: isSpendingDisabled ? 'not-allowed' : 'pointer', opacity: isSpendingDisabled ? 0.5 : 1 }"
              >
                Gastos
              </a>
            </li>
          </ul>
        </div>

        <div class="col-12">
          <div v-if="currentView === 'details'">
            <TaskTable />
          </div>

          <div v-if="currentView === 'ganttAndCriticalPaths'">
            <div class="page-break"></div>
            <GanttProject2 />
            <!-- <GanttProject /> -->
            <div class="page-break"></div>
            <CriticalPaths />
          </div>

          <div v-if="currentView === 'spending' && !isSpendingDisabled">
            <ProjectSpending />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3">Cargando proyecto...</p>
    </div>

    <AddItemModal />
    <DeleteModal />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'nuxt/app';
import { useProjectStore } from '../stores/project'

const projectStore = useProjectStore()
const route = useRoute()

const currentView = ref('details');
// Estado para deshabilitar temporalmente la pestaña de gastos
const isSpendingDisabled = ref(true)

onMounted(async () => {
  const templateId = route.query.tid as string || 't000';

  if (projectStore.projectData == null) {
    try {
      await projectStore.getTemplate(templateId, 'onMounted');
      // El toast se muestra desde el store automáticamente
    } catch (error) {
      console.error('Error al inicializar el proyecto:', error);
      projectStore.setError('No se pudo cargar el proyecto. Intente de nuevo.');
    }
  }
})

onBeforeRouteLeave((to, from, next) => {
  if (to.path !== from.path) {
    projectStore.$reset();
  }
  next();
});


</script>