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
            <ProjectCard v-for="project in projects" :key="project.id" :project="project" @edit-project="editProject"
              @delete-project="deleteProject" @duplicate-project="duplicateProject" />
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
const loadProjectList = async () => {
  try {
    // Simulación de datos - reemplaza con tu lógica real
    projects.value = [
      {
        id: 'p001',
        title: 'Blank Project',
        subtitle: 'Caso en blanco',
        startDate: formatDateToDisplay(new Date())!,
        endDate: formatDateToDisplay(new Date())!,
      },
      {
        id: 'p002',
        title: 'SS MT',
        subtitle: 'Ejemplo solicitud de suministro en MT.',
        startDate: '15-07-2025' as TDateString,
        endDate: '15-07-2025' as TDateString,
      },
      {
        id: 'p003',
        title: 'Ejemplo',
        subtitle: 'Ejemplo de pruebas.',
        startDate: '15-07-2025' as TDateString,
        endDate: '15-07-2025' as TDateString,
      },
    ]
  } catch (error) {
    console.error('Error loading projects:', error)
  }
}

// Handlers para eventos del componente
const createProject = () => {
  // Lógica para crear nuevo proyecto
  console.log('Crear nuevo proyectooO')
  // Aquí podrías abrir un modal o navegar a una página de creación
  projectStore.newProject()
  navigateTo(`project/${projectStore.projectId}`)
}

const editProject = (project: IProjectHeader) => {
  // Lógica para editar proyecto
  console.log('Editar proyecto:', project)
  // Aquí podrías abrir un modal de edición
}

const deleteProject = (project: IProjectHeader) => {
  // Lógica para eliminar proyecto
  console.log('Eliminar proyecto:', project)
  // Aquí podrías mostrar un modal de confirmación
  if (confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.title}"?`)) {
    projects.value = projects.value.filter(p => p.id !== project.id)
  }
}

const duplicateProject = (project: IProjectHeader) => {
  // Lógica para duplicar proyecto
  console.log('Duplicar proyecto:', project)
  const newProject: IProjectHeader = {
    ...project,
    id: `${project.id}-copy-${Date.now()}`,
    title: `${project.title} (Copia)`,
    subtitle: `${project.subtitle}`,
    startDate: project.startDate
  }
  projects.value.unshift(newProject)
}

// Lifecycle
onMounted(() => {
  loadProjectList()
})
</script>

<style scoped>
.display-4 {
  font-size: 2.5rem;
}
</style>