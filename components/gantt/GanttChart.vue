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
    
    <div ref="ganttContainer" id="gantt-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useProjectStore } from '../../stores/project'
import { ganttRenderer } from './ganttRenderer'
import type { Scale } from './ganttHelpers'
import { useUIStore } from '../../stores/ui';

const projectStore = useProjectStore();
const uiStore = useUIStore();
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
}

// Función para renderizar el diagrama de Gantt
function renderGantt() {
  const projectData = projectStore.projectData
  if (ganttContainer.value && projectData) {
    // Renderizar el diagrama de Gantt usando la función ganttRenderer
    ganttRenderer(projectData, scale.value, ganttContainer.value, uiStore.criticalPathIndex)
  }
}

// Renderizar el diagrama de Gantt cuando el componente se monte
onMounted(() => {
  renderGantt()
})

// Volver a renderizar cuando cambien las fechas del proyecto o la escala
watch(
  () => [projectStore.projectData, projectStore.currentScale, uiStore.criticalPathIndex],
  () => {
    renderGantt()
  },
  { deep: true }
)
</script>

<style scoped>
.gantt-container {
  overflow-x: auto;
  padding: 10px;
}
</style>