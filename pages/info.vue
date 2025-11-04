<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/" class="text-blue-600 hover:text-blue-800">
              ← Volver al Proyecto
            </NuxtLink>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Sistema de Gestión de Proyectos - Documentación</h1>
              <p class="text-sm text-gray-600 mt-1">{{ getPageTitle(currentPage) }}</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- Sidebar Navigation -->
        <aside class="w-64 flex-shrink-0">
          <nav class="bg-white rounded-lg shadow-sm p-6 sticky top-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Navegación</h2>
            <ul class="space-y-2">
              <li>
                <button @click="currentPage = 'index'" :class="[
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  currentPage === 'index'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                ]">
                  <i class="bi bi-house-fill me-2"></i>Inicio
                </button>
              </li>
              <li>
                <button @click="currentPage = 'project'" :class="[
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  currentPage === 'project'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                ]">
                  <i class="bi bi-clipboard-data me-2"></i>¿Qué es un Project?
                </button>
              </li>
              <li>
                <button @click="currentPage = 'item'" :class="[
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  currentPage === 'item'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                ]">
                  <i class="bi bi-puzzle me-2"></i>¿Qué es un Item?
                </button>
              </li>
              <li>
                <button @click="currentPage = 'process'" :class="[
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  currentPage === 'process'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                ]">
                  <i class="bi bi-folder me-2"></i>¿Qué es un Process?
                </button>
              </li>
              <li>
                <button @click="currentPage = 'milestone'" :class="[
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  currentPage === 'milestone'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                ]">
                  <i class="bi bi-flag me-2"></i>¿Qué es un Milestone?
                </button>
              </li>
              <li>
                <button @click="currentPage = 'task'" :class="[
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  currentPage === 'task'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                ]">
                  <i class="bi bi-check-square me-2"></i>¿Qué es un Task?
                </button>
              </li>
              <li>
                <button @click="currentPage = 'date-calculation'" :class="[
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  currentPage === 'date-calculation'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                ]">
                  <i class="bi bi-calendar-event me-2"></i>Cálculo de Fechas
                </button>
              </li>
              <li>
                <button @click="currentPage = 'critical-path'" :class="[
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  currentPage === 'critical-path'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                ]">
                  <i class="bi bi-exclamation-triangle me-2"></i>Camino Crítico
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1">
          <div class="bg-white rounded-lg shadow-sm p-8">
            <div ref="contentRef" v-html="currentContent" class="prose prose-lg max-w-none" @click="handleContentClick">
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import { useDocumentation } from '../composables/useDocumentation'

// Configurar marked para mejor renderizado
marked.setOptions({
  breaks: true,
  gfm: true
})

const currentPage = ref('index')
const contentRef = ref<HTMLElement>()

// Contenido de las páginas
const pages = ref<Record<string, string>>({})

const currentContent = computed(() => {
  const content = pages.value[currentPage.value] || '# Cargando...'
  return marked(content)
})

// Usar el composable de documentación
const { pages: docPages, loadDocumentation } = useDocumentation()

// Cargar contenido de documentación
onMounted(() => {
  loadDocumentation()
  pages.value = docPages.value
})

// Función para navegar entre páginas desde los enlaces del contenido
const navigateToPage = (pageId: string) => {
  currentPage.value = pageId
  // Scroll to top cuando cambie de página
  nextTick(() => {
    if (contentRef.value) {
      contentRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

// Mapeo de enlaces a páginas
const linkToPageMap: Record<string, string> = {
  '#project': 'project',
  '#item': 'item',
  '#process': 'process',
  '#milestone': 'milestone',
  '#task': 'task',
  '#date-calculation': 'date-calculation',
  '#critical-path': 'critical-path'
}

// Función para manejar clics en el contenido
const handleContentClick = (event: Event) => {
  const target = event.target as HTMLElement

  if (target.tagName === 'A') {
    const href = target.getAttribute('href')

    if (href && linkToPageMap[href]) {
      event.preventDefault()
      navigateToPage(linkToPageMap[href])
    }
  }
}

// Función para obtener el título de la página actual
const getPageTitle = (pageId: string) => {
  const titles: Record<string, string> = {
    'index': 'Inicio - Conceptos Básicos',
    'project': 'Projects - Entidad Principal',
    'item': 'Items - Clase Base',
    'process': 'Processes - Contenedores Jerárquicos',
    'milestone': 'Milestones - Hitos del Proyecto',
    'task': 'Tasks - Trabajo Real',
    'date-calculation': 'Cálculo de Fechas',
    'critical-path': 'Camino Crítico'
  }
  return titles[pageId] || 'Documentación'
}

// Meta tags para SEO
useHead({
  title: 'Sistema de Gestión de Proyectos - Documentación',
  meta: [
    { name: 'description', content: 'Documentación técnica del sistema de gestión de proyectos' }
  ]
})
</script>

<style scoped>
/* Estilos adicionales para la documentación */
:deep(.prose) {
  @apply text-gray-800;
}

:deep(.prose h1) {
  @apply text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200;
}

:deep(.prose h2) {
  @apply text-2xl font-semibold text-gray-800 mt-8 mb-4;
}

:deep(.prose h3) {
  @apply text-xl font-medium text-gray-700 mt-6 mb-3;
}

:deep(.prose h4) {
  @apply text-lg font-medium text-gray-700 mt-4 mb-2;
}

:deep(.prose p) {
  @apply mb-4 leading-relaxed;
}

:deep(.prose ul) {
  @apply mb-4 pl-6;
}

:deep(.prose li) {
  @apply mb-2;
}

:deep(.prose code) {
  @apply bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800;
}

:deep(.prose pre) {
  @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4;
}

:deep(.prose pre code) {
  @apply bg-transparent px-0 py-0 text-gray-100;
}

:deep(.prose blockquote) {
  @apply border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4;
}

:deep(.prose a) {
  @apply text-blue-600 hover:text-blue-800 underline;
}

:deep(.prose strong) {
  @apply font-semibold text-gray-900;
}

:deep(.prose table) {
  @apply w-full border-collapse border border-gray-300 mb-4;
}

:deep(.prose th) {
  @apply bg-gray-100 border border-gray-300 px-4 py-2 font-semibold text-left;
}

:deep(.prose td) {
  @apply border border-gray-300 px-4 py-2;
}

/* Estilos adicionales para mejorar la legibilidad */
:deep(.prose) {
  line-height: 1.7;
}

:deep(.prose h1):first-child {
  margin-top: 0;
}

:deep(.prose ul ul) {
  @apply mt-2 mb-2;
}

:deep(.prose li) {
  @apply leading-relaxed;
}

/* Estilo para código inline */
:deep(.prose code:not(pre code)) {
  @apply bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded text-sm;
}

/* Estilo para bloques de código */
:deep(.prose pre) {
  @apply bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6 shadow-lg;
}

:deep(.prose pre code) {
  @apply bg-transparent text-gray-100 text-sm;
}

/* Estilos para la navegación entre páginas */
:deep(.prose hr) {
  @apply border-gray-300 my-8;
}

:deep(.prose p:has(strong:contains("Navegación"))) {
  @apply bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500 text-center;
}

/* Mejorar enlaces de navegación */
:deep(.prose a[href^="#"]) {
  @apply inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md no-underline hover:bg-blue-200 transition-colors;
}

:deep(.prose a[href^="#"]:hover) {
  @apply bg-blue-200;
}
</style>