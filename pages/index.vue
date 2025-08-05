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
      <h4>Mis Proyectos</h4>
      <button class="btn btn-primary btn-sm" @click="createProject">
        <i class="bi bi-plus-circle"></i> Nuevo Proyecto
      </button>
    </div>
    
    <div v-if="projects.length === 0" class="text-center py-5">
      <div class="text-muted">
        <i class="bi bi-folder2-open" style="font-size: 3rem;"></i>
        <p class="mt-3">No tienes proyectos aún</p>
        <button class="btn btn-primary" @click="createProject">
          Crear tu primer proyecto
        </button>
      </div>
    </div>
    
    <div v-else class="list-group">
      <ProjectCard 
        v-for="project in projects" 
        :key="project.id"
        :project="project"
        @edit-project="editProject"
        @delete-project="deleteProject"
        @duplicate-project="duplicateProject"
      />
    </div>
  </div>
        

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IProjectData } from '../src/models/Project'
import { useProjectStore } from '../stores/project'
import { useRoute } from 'vue-router';
import { navigateTo } from 'nuxt/app';

const projectStore = useProjectStore()

// Definir la interfaz del proyecto
interface ProjectItem {
  id: string
  title: string
  description?: string
  lastAccess: Date
  isActive?: boolean
  itemCount?: number
  progress?: number
  createdAt: Date
  updatedAt: Date
}

// Estado reactivo
const projects = ref<IProjectData[]>([])

// Cargar proyectos (simulado - aquí conectarías con tu API/store)
const loadProjects = async () => {
  try {
    // Simulación de datos - reemplaza con tu lógica real
    projects.value = [
      {
        id: 'p001',
        title: 'Blank Project',
        subTitle: 'Caso en blanco',
        //createdAt: new Date('2024-01-15'),
        //updatedAt: new Date()
      },
      {
        id: 'p002',
        title: 'SS MT',
        subTitle: 'Ejemplo solicitud de suministro en MT.',
        //createdAt: new Date('2024-02-01'),
        //updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'p003',
        title: 'Ejemplo',
        subTitle: 'Ejemplo de pruebas.',
        //createdAt: new Date('2024-02-01'),
        //updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
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
  navigateTo(`project/${projectStore.controller.getProject().getId()}`)
}

const editProject = (project: IProjectData) => {
  // Lógica para editar proyecto
  console.log('Editar proyecto:', project)
  // Aquí podrías abrir un modal de edición
}

const deleteProject = (project: IProjectData) => {
  // Lógica para eliminar proyecto
  console.log('Eliminar proyecto:', project)
  // Aquí podrías mostrar un modal de confirmación
  if (confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.title}"?`)) {
    projects.value = projects.value.filter(p => p.id !== project.id)
  }
}

const duplicateProject = (project: IProjectData) => {
  // Lógica para duplicar proyecto
  console.log('Duplicar proyecto:', project)
  const newProject: IProjectData = {
    ...project,
    id: `${project.id}-copy-${Date.now()}`,
    title: `${project.title} (Copia)`,
    subTitle: `${project.subTitle}`,
  }
  projects.value.unshift(newProject)
}

// Lifecycle
onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.display-4 {
  font-size: 2.5rem;
}
</style>