<template>
  <div class="container my-4">
    <div v-if="projectStore.projectData != null">
      <ProjectHeader />
      <ProjectToolbar />

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
              <a class="nav-link" :class="{
                active: currentView === 'spending',
                disabled: isSpendingDisabled
              }" @click.prevent="!isSpendingDisabled && (currentView = 'spending')" href="#"
                :style="{ cursor: isSpendingDisabled ? 'not-allowed' : 'pointer', opacity: isSpendingDisabled ? 0.5 : 1 }">
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
            <GanttProject2 />
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

    <!-- Modales de edición (solo si puede editar) -->
    <AddItemModal v-if="projectStore.canEdit" />
    <DeleteModal v-if="projectStore.canEdit" />

    <!-- Componente PDF oculto -->
    <div style="display: none;">
      <PdfProjectReport ref="pdfReportRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onBeforeRouteLeave, useRoute, useHead, navigateTo } from 'nuxt/app'
import { useProjectStore } from '../../stores/project'
import { useAuthStore } from '../../stores/auth'
import PdfProjectReport from '../../components/pdf/ProjectReport.vue'

const projectStore = useProjectStore()
const authStore = useAuthStore()
const route = useRoute()

const currentView = ref('details')
const isSpendingDisabled = ref(true)
const pdfReportRef = ref()

const projectId = route.params.id as string

onMounted(async () => {
  if (!projectId) {
    projectStore.setError('ID de proyecto no válido')
    return
  }

  try {
    // Caso especial: si el ID es "loaded", usar proyecto ya cargado en store
    if (projectId === 'loaded') {
      if (projectStore.projectData) {
        console.log('✅ Usando proyecto cargado desde archivo:', projectStore.projectData.title)
        return
      } else {
        console.log('❌ No hay proyecto cargado en store')
        if (authStore.isAuthenticated) {
          await navigateTo('/project/new')
        } else {
          projectStore.setError('No hay proyecto cargado. Inicia sesión para crear proyectos.')
        }
        return
      }
    }

    // Caso especial: si el ID es "new", crear un nuevo proyecto (requiere autenticación)
    if (projectId === 'new') {
      if (!authStore.isAuthenticated) {
        console.log('Usuario no autenticado, redirigiendo al login para crear proyecto...')
        await navigateTo('/login')
        return
      }
      console.log('ID "new" detectado, creando nuevo proyecto...')
      const newProjectId = 'p' + Date.now()
      await projectStore.createTemporaryProject(newProjectId)
      return
    }

    // Intentar cargar como template predefinido (t000, t001, etc.)
    if (projectId.startsWith('t')) {
      console.log('Cargando template predefinido:', projectId)
      await projectStore.getTemplate(projectId, 'project/[id].vue')
      return
    }

    // Si no es template, intentar cargar desde base de datos
    await projectStore.loadProjectById(projectId)
  } catch (error) {
    console.error('Error al cargar proyecto:', error)

    // Si el proyecto no existe y hay usuario logueado, crear borrador temporal
    if (authStore.isAuthenticated) {
      console.log('Proyecto no encontrado, creando borrador temporal...')
      await projectStore.createTemporaryProject(projectId)
    } else {
      projectStore.setError('Proyecto no encontrado. Inicia sesión para crear proyectos.')
    }
  }
})

onBeforeRouteLeave((to, from, next) => {
  // No resetear el store si se navega a /project/loaded (proyecto cargado desde archivo)
  if (to.path !== from.path && to.path !== '/project/loaded') {
    projectStore.$reset()
  }
  next()
})

// Middleware de autenticación (manejado manualmente en onMounted)
// definePageMeta({
//   middleware: 'auth'
// })

// Meta tags dinámicos
useHead({
  title: computed(() =>
    projectStore.projectTitle
      ? `${projectStore.projectTitle} - Proyecto`
      : 'Proyecto'
  ),
  meta: [
    {
      name: 'description',
      content: computed(() =>
        projectStore.projectSubtitle || 'Visualiza y gestiona este proyecto'
      )
    }
  ]
})
</script>