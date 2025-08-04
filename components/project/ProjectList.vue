<template>
  <div class="project-list">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Mis Proyectos</h4>
      <button class="btn btn-primary btn-sm" @click="createNewProject">
        <i class="bi bi-plus-circle"></i> Nuevo Proyecto
      </button>
    </div>
    
    <div v-if="projects.length === 0" class="text-center py-5">
      <div class="text-muted">
        <i class="bi bi-folder2-open" style="font-size: 3rem;"></i>
        <p class="mt-3">No tienes proyectos aún</p>
        <button class="btn btn-primary" @click="createNewProject">
          Crear tu primer proyecto
        </button>
      </div>
    </div>
    
    <div v-else class="list-group">
      <NuxtLink 
        v-for="project in sortedProjects" 
        :key="project.id"
        :to="`/project/${project.id}`" 
        class="list-group-item list-group-item-action"
        :class="{ 'border-primary': project.isActive }"
      >
        <div class="d-flex w-100 justify-content-between align-items-start">
          <div class="flex-grow-1">
            <div class="d-flex w-100 justify-content-between">
              <h6 class="mb-1">{{ project.title || 'Sin título' }}</h6>
              <small class="text-muted">{{ formatLastAccess(project.lastAccess) }}</small>
            </div>
            <p class="mb-1 text-muted">{{ project.description || 'Sin descripción' }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">ID: {{ project.id }}</small>
              <div class="d-flex gap-2">
                <span v-if="project.isActive" class="badge bg-success">Activo</span>
                <span class="badge bg-secondary">{{ project.itemCount || 0 }} items</span>
                <span v-if="project.progress !== undefined" class="badge bg-info">{{ project.progress }}% completado</span>
              </div>
            </div>
          </div>
          <div class="dropdown ms-2" @click.prevent>
            <button 
              class="btn btn-sm btn-outline-secondary dropdown-toggle" 
              type="button" 
              :id="`dropdown-${project.id}`"
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu" :aria-labelledby="`dropdown-${project.id}`">
              <li>
                <button class="dropdown-item" @click="editProject(project)">
                  <i class="bi bi-pencil"></i> Editar
                </button>
              </li>
              <li>
                <button class="dropdown-item" @click="duplicateProject(project)">
                  <i class="bi bi-files"></i> Duplicar
                </button>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item text-danger" @click="deleteProject(project)">
                  <i class="bi bi-trash"></i> Eliminar
                </button>
              </li>
            </ul>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

// Props
interface Props {
  projects: ProjectItem[]
  sortBy?: 'lastAccess' | 'title' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props>(), {
  sortBy: 'lastAccess',
  sortOrder: 'desc'
})

// Emits
const emit = defineEmits<{
  'create-project': []
  'edit-project': [project: ProjectItem]
  'delete-project': [project: ProjectItem]
  'duplicate-project': [project: ProjectItem]
}>()

// Computed
const sortedProjects = computed(() => {
  const sorted = [...props.projects].sort((a, b) => {
    let aValue: any
    let bValue: any
    
    switch (props.sortBy) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case 'lastAccess':
      default:
        aValue = new Date(a.lastAccess).getTime()
        bValue = new Date(b.lastAccess).getTime()
        break
    }
    
    if (props.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  return sorted
})

// Methods
const formatLastAccess = (date: Date): string => {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - new Date(date).getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return 'Hoy'
  } else if (diffDays === 2) {
    return 'Ayer'
  } else if (diffDays <= 7) {
    return `Hace ${diffDays - 1} días`
  } else {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

const createNewProject = () => {
  emit('create-project')
}

const editProject = (project: ProjectItem) => {
  emit('edit-project', project)
}

const deleteProject = (project: ProjectItem) => {
  emit('delete-project', project)
}

const duplicateProject = (project: ProjectItem) => {
  emit('duplicate-project', project)
}
</script>

<style scoped>
.project-list {
  max-width: 800px;
  margin: 0 auto;
}

.list-group-item {
  transition: all 0.2s ease;
}

.list-group-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.dropdown-toggle::after {
  display: none;
}

.badge {
  font-size: 0.75rem;
}
</style>