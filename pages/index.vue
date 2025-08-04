<template>
  <div class="container my-4">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="text-center mb-5">
          <h1 class="display-4 fw-bold text-primary">Planner</h1>
          <!--<p class="lead text-muted">Gestiona tus proyectos de manera eficiente</p>-->
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

// Cargar proyectos (simulado - aquí conectarías con tu API/store)
const loadProjects = async () => {
  try {
    // Simulación de datos - reemplaza con tu lógica real
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
      },
      {
        id: 'project-002',
        title: 'Desarrollo Web',
        description: 'Sitio web corporativo con funcionalidades avanzadas.',
        lastAccess: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // hace 2 días
        isActive: false,
        itemCount: 8,
        progress: 30,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'project-003',
        title: 'App Mobile',
        description: 'Aplicación móvil para gestión de inventarios.',
        lastAccess: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // hace 1 semana
        isActive: false,
        itemCount: 22,
        progress: 85,
        createdAt: new Date('2023-12-10'),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]
  } catch (error) {
    console.error('Error loading projects:', error)
  }
}

// Handlers para eventos del componente
const handleCreateProject = () => {
  // Lógica para crear nuevo proyecto
  console.log('Crear nuevo proyecto')
  // Aquí podrías abrir un modal o navegar a una página de creación
}

const handleEditProject = (project: ProjectItem) => {
  // Lógica para editar proyecto
  console.log('Editar proyecto:', project)
  // Aquí podrías abrir un modal de edición
}

const handleDeleteProject = (project: ProjectItem) => {
  // Lógica para eliminar proyecto
  console.log('Eliminar proyecto:', project)
  // Aquí podrías mostrar un modal de confirmación
  if (confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.title}"?`)) {
    projects.value = projects.value.filter(p => p.id !== project.id)
  }
}

const handleDuplicateProject = (project: ProjectItem) => {
  // Lógica para duplicar proyecto
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

<style scoped>
.display-4 {
  font-size: 2.5rem;
}
</style>