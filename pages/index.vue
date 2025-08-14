<template>
  <div class="container my-4">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="text-center mb-5">
          <h1 class="display-4 fw-bold text-primary">Planner</h1>
          <!--<p class="lead text-muted">Gestiona tus proyectos de manera eficiente</p>-->
        </div>


        <div class="project-list">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Templates</h4>
            <div>
              <button class="btn btn-outline-primary btn-sm mx-1" @click="createProject">
                <i class="bi bi-plus-circle"></i> ➕ Nuevo Proyecto
              </button>
              <!-- <button class="btn btn-outline-secondary btn-sm mx-1" @click="loadProject">
                <i class="bi bi-upload"></i> 💾 Cargar Proyecto
              </button> -->
              <ProjectLoader />
            </div>
          </div>

          <div v-if="projects.length === 0" class="text-center py-5">
            <div class="text-muted">
              <i class="bi bi-folder2-open" style="font-size: 3rem;"></i>
              <p class="mt-3">No tienes proyectos aún</p>
            </div>
          </div>

          <div v-else class="list-group">
            <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IProjectHeader } from '../src/models/Project'
import { useProjectStore } from '../stores/project'
import { navigateTo } from 'nuxt/app';
import { formatDateToDisplay, TDateString } from '../src/models/dateFunc';

const projectStore = useProjectStore()

// Estado reactivo
const projects = ref<IProjectHeader[]>([])

// Cargar proyectos (simulado - aquí conectarías con tu API/store)
const loadTemplatesList = async () => {
  try {
    // Simulación de datos - reemplaza con tu lógica real
    projects.value = [
      {
        id: 'p001',
        title: 'SS MT con SB',
        subtitle: 'Solicitud de suministro en MT con SB nueva.',
        startDate: '15-07-2025' as TDateString,
        endDate: '15-07-2025' as TDateString,
      },
      {
        id: 'p002',
        title: 'Ejemplo',
        subtitle: 'Ejemplo de pruebas.',
        startDate: '15-07-2025' as TDateString,
        endDate: '15-07-2025' as TDateString,
      },
      {
        id: 'p003',
        title: 'Blank Project',
        subtitle: 'Caso en blanco',
        startDate: formatDateToDisplay(new Date())!,
        endDate: formatDateToDisplay(new Date())!,
      },
    ]
  } catch (error) {
    console.error('Error loading projects:', error)
  }
}

// Handlers para eventos del componente
const createProject = async () => {
  // Lógica para crear nuevo proyecto
  console.log('Crear nuevo proyecto')
  // Aquí podrías abrir un modal o navegar a una página de creación
  await projectStore.newProject()
  navigateTo('/project')
}

// Lifecycle
onMounted(() => {
  loadTemplatesList()
})
</script>

<style scoped>
.display-4 {
  font-size: 2.5rem;
}
</style>