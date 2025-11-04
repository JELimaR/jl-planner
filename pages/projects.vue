<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>
        <i class="bi bi-folder me-2"></i>Mis Proyectos
      </h1>
      <NuxtLink to="/project/new" class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i>Nuevo Proyecto
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3">Cargando proyectos...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <!-- Empty state -->
    <div v-else-if="projects.length === 0" class="text-center my-5">
      <i class="bi bi-folder-x display-1 text-muted"></i>
      <h3 class="mt-3">No tienes proyectos guardados</h3>
      <p class="text-muted">Crea tu primer proyecto para comenzar</p>
      <NuxtLink to="/project/new" class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i>Crear Proyecto
      </NuxtLink>
    </div>

    <!-- Projects list -->
    <div v-else class="row">
      <div v-for="project in projects" :key="project.id" class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title">{{ project.title }}</h5>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button"
                  :id="`dropdown-${project.id}`" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots"></i>
                </button>
                <ul class="dropdown-menu" :aria-labelledby="`dropdown-${project.id}`">
                  <li>
                    <button class="dropdown-item" @click="openProject(project.id)">
                      <i class="bi bi-eye me-2"></i>Abrir
                    </button>
                  </li>
                  <li>
                    <button class="dropdown-item" @click="duplicateProject(project)">
                      <i class="bi bi-files me-2"></i>Duplicar
                    </button>
                  </li>
                  <li>
                    <hr class="dropdown-divider">
                  </li>
                  <li>
                    <button class="dropdown-item text-danger" @click="deleteProject(project)">
                      <i class="bi bi-trash me-2"></i>Eliminar
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <p v-if="project.subtitle" class="card-text text-muted small">
              {{ project.subtitle }}
            </p>

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                <span v-if="project.isPublic" class="badge bg-success me-1">
                  <i class="bi bi-globe me-1"></i>Público
                </span>
                <span v-if="project.isTemplate" class="badge bg-info me-1">
                  <i class="bi bi-file-earmark-text me-1"></i>Plantilla
                </span>
              </div>
              <small class="text-muted">
                {{ formatDate(project.updatedAt) }}
              </small>
            </div>
          </div>

          <div class="card-footer bg-transparent">
            <button class="btn btn-primary btn-sm w-100" @click="openProject(project.id)">
              <i class="bi bi-arrow-right-circle me-2"></i>Abrir Proyecto
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectStore } from '../stores/project'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import { navigateTo } from 'nuxt/app'

// Middleware de autenticación
// @ts-ignore
definePageMeta({
  middleware: 'auth'
})

// Meta tags
// @ts-ignore
useHead({
  title: 'Mis Proyectos - Planner',
  meta: [
    { name: 'description', content: 'Gestiona y organiza todos tus proyectos' }
  ]
})

const projectStore = useProjectStore()
const authStore = useAuthStore()
const { showSuccess, showError, showWarning } = useToast()

const projects = ref<any[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  await loadProjects()
})

const loadProjects = async () => {
  isLoading.value = true
  error.value = null

  try {
    projects.value = await projectStore.getUserProjects()
  } catch (err) {
    error.value = 'Error al cargar los proyectos'
    console.error('Error loading projects:', err)
  } finally {
    isLoading.value = false
  }
}

const openProject = async (projectId: string) => {
  await navigateTo(`/project/${projectId}`)
}

const duplicateProject = async (project: any) => {
  // TODO: Implementar duplicación de proyecto
  showWarning('Función no disponible', 'La duplicación de proyectos estará disponible próximamente')
}

const deleteProject = async (project: any) => {
  // TODO: Implementar eliminación de proyecto
  showWarning('Función no disponible', 'La eliminación de proyectos estará disponible próximamente')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

</script>