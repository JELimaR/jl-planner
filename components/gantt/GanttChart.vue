<template>
  <div class="gantt-container">
    <div class="gantt-scale-selector mb-3">
      <div class="btn-group">
        <button 
          v-for="option in scaleOptions" 
          :key="option.value"
          class="btn btn-sm" 
          :class="{ 'btn-primary': scale === option.value, 'btn-outline-primary': scale !== option.value }"
          @click="changeScale(option.value as Scale)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    
    <!-- Contenedor para el diagrama de Gantt renderizado por ganttRenderer -->
    <div ref="ganttContainer" id="gantt-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useProjectStore } from '../../stores/project'
import { ganttRenderer } from '../../src/views/ganttRenderer'
import { setProjectItemsColors } from '../../src/views/colors'
import { ProjectController } from '../../src/controllers/ProjectController'
import type { Scale } from '../../src/views/ganttHelpers'

const projectStore = useProjectStore()
const ganttContainer = ref<HTMLElement | null>(null)

// Obtener la escala actual del store
const scale = ref<Scale>(projectStore.currentScale || 'week')

// Opciones de escala para los botones
const scaleOptions = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' }
]

// Función para cambiar la escala
function changeScale(newScale: Scale) {
  scale.value = newScale
  projectStore.currentScale = newScale
  renderGantt()
}

// Función para renderizar el diagrama de Gantt
function renderGantt() {
  if (ganttContainer.value) {
    const project = ProjectController.getInstance().getProject()
    // Aplicar colores a los elementos del proyecto
    setProjectItemsColors(project)
    
    // Renderizar el diagrama de Gantt usando la función ganttRenderer
    ganttRenderer(project, scale.value)
  }
}

// Renderizar el diagrama de Gantt cuando el componente se monte
onMounted(() => {
  renderGantt()
})

// Volver a renderizar cuando cambien las fechas del proyecto o la escala
watch(
  () => [projectStore.projectStartDate, projectStore.projectEndDate, projectStore.currentScale],
  () => {
    renderGantt()
  }
)
</script>

<style scoped>
.gantt-container {
  overflow-x: auto;
  padding: 10px;
}
</style>