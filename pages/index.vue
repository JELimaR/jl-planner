<template>
  <div class="container my-4">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="text-center mb-5">
          <h1 class="display-4 fw-bold text-primary">Planner</h1>

        </div>


        <div class="project-list">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Templates</h4>
            <div>
              <button class="btn btn-outline-primary btn-sm mx-1" @click="createProject">
                <i class="bi bi-plus-circle me-1"></i>Nuevo Proyecto
              </button>

              <ProjectLoader />
            </div>
          </div>

          <div v-if="projectStore.templates.length === 0" class="text-center py-5">
            <div class="text-muted">
              <i class="bi bi-folder2-open" style="font-size: 3rem;"></i>
              <p class="mt-3">No tienes proyectos aún</p>
            </div>
          </div>

          <div v-else class="list-group">
            <ProjectCard v-for="project in projectStore.templates" :key="project.id" :project="project" />
          </div>
        </div>

        <!-- Sección de Proyectos Públicos -->
        <div class="project-list mt-5">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Proyectos Públicos</h4>
            <button class="btn btn-outline-info btn-sm" @click="loadPublicProjects">
              <i class="bi bi-arrow-clockwise"></i> Actualizar
            </button>
          </div>

          <div v-if="loadingPublicProjects" class="text-center py-3">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando proyectos públicos...</span>
            </div>
          </div>

          <div v-else-if="publicProjectsError" class="alert alert-warning">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ publicProjectsError }}
          </div>

          <div v-else-if="publicProjects.length === 0" class="text-center py-4">
            <div class="text-muted">
              <i class="bi bi-globe" style="font-size: 2rem;"></i>
              <p class="mt-2">No hay proyectos públicos disponibles</p>
            </div>
          </div>

          <div v-else class="row">
            <div v-for="project in publicProjects" :key="project.id" class="col-md-6 col-lg-4 mb-3">
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title">{{ project.title }}</h6>
                    <span class="badge bg-success">
                      <i class="bi bi-globe"></i>
                    </span>
                  </div>

                  <p v-if="project.subtitle" class="card-text text-muted small">
                    {{ project.subtitle }}
                  </p>

                  <div class="mt-auto">
                    <small class="text-muted">
                      Actualizado: {{ formatDate(project.updatedAt) }}
                    </small>
                  </div>
                </div>

                <div class="card-footer bg-transparent">
                  <button class="btn btn-outline-primary btn-sm w-100" @click="openPublicProject(project.id)">
                    <i class="bi bi-eye me-1"></i>Ver Proyecto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectStore } from '../stores/project'
import { navigateTo } from 'nuxt/app';

const projectStore = useProjectStore()

// Estado para proyectos públicos
const publicProjects = ref<any[]>([])
const loadingPublicProjects = ref(false)
const publicProjectsError = ref<string | null>(null)

// Handlers para eventos del componente
const createProject = async () => {
  // Lógica para crear nuevo proyecto
  console.log('Crear nuevo proyecto')
  // Navegar a /project/new para crear un nuevo proyecto
  navigateTo('/project/new')
}

const loadPublicProjects = async () => {
  loadingPublicProjects.value = true
  publicProjectsError.value = null

  try {
    console.log('🔄 Cargando proyectos públicos...')
    const response = await $fetch('/api/projects?public=true')

    if ((response as any).success) {
      publicProjects.value = (response as any).projects
      console.log('✅ Proyectos públicos cargados:', publicProjects.value.length)
    } else {
      throw new Error('Respuesta no exitosa del servidor')
    }
  } catch (error) {
    console.error('❌ Error cargando proyectos públicos:', error)
    publicProjectsError.value = 'Error al cargar proyectos públicos'
  } finally {
    loadingPublicProjects.value = false
  }
}

const openPublicProject = async (projectId: string) => {
  await navigateTo(`/project/${projectId}`)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  projectStore.getTemplateHeaders();
  loadPublicProjects();
})
</script>

<style scoped>
.display-4 {
  font-size: 2.5rem;
}
</style>