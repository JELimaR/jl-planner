<template>
  <div class="container my-4">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="text-center mb-5">
          <h1 class="display-4 fw-bold text-primary">Seleccionar Proyecto</h1>
          <p class="lead text-muted">Elige un proyecto para trabajar</p>
        </div>
        
        <ProjectList 
          :projects="projects"
          @create-project="handleCreateProject"
          @edit-project="handleEditProject"
          @delete-project="handleDeleteProject"
          @duplicate-project="handleDuplicateProject"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProjectList from '../components/project/ProjectList.vue'

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
const projects = ref<ProjectItem[]>([])

// Cargar proyectos
const loadProjects = async () => {
  try {
    // Aquí cargarías los proyectos desde tu API/store
    projects.value = [
      {
        id: 'project-001',
        title: 'Proyecto Principal',
        description: 'Proyecto de ejemplo con tareas y milestones.',
        lastAccess: new Date(),
        isActive: true,
        itemCount: 15,
        progress: 65,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      }
    ]
  } catch (error) {
    console.error('Error loading projects:', error)
  }
}

// Handlers para eventos del componente
const handleCreateProject = () => {
  console.log('Crear nuevo proyecto')
}

const handleEditProject = (project: ProjectItem) => {
  console.log('Editar proyecto:', project)
}

const handleDeleteProject = (project: ProjectItem) => {
  console.log('Eliminar proyecto:', project)
  if (confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.title}"?`)) {
    projects.value = projects.value.filter(p => p.id !== project.id)
  }
}

const handleDuplicateProject = (project: ProjectItem) => {
  console.log('Duplicar proyecto:', project)
  const newProject: ProjectItem = {
    ...project,
    id: `${project.id}-copy-${Date.now()}`,
    title: `${project.title} (Copia)`,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastAccess: new Date(),
    isActive: false
  }
  projects.value.unshift(newProject)
}

// Lifecycle
onMounted(() => {
  loadProjects()
})
</script>