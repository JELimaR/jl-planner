<template>
  <div class="gantt-view">
    <div v-if="projectStore.isLoading" class="loading-state">
      Cargando proyecto...
    </div>
    <div v-else-if="projectData">
      <div class="container gantt-scale-selector mb-3">
        <div class="btn-group">
          <button v-for="option in scaleOptions" :key="option.value" class="btn btn-sm"
            :class="{ 'btn-primary': scale === option.value, 'btn-outline-primary': scale !== option.value }"
            @click="changeScale(option.value as Scale)">
            {{ option.label }}
          </button>
        </div>
      </div>
      <div class="gantt-container">
        <div class="gantt-chart-content">
          <GanttLeftTable :project-data="projectData" :row-height="rowHeight"
            :critical-path-index="criticalPathIndex" />

          <div class="gantt-scrollable-area">
            <GanttCalendar :project-start-date="calendarLimits.calendarStartDate"
              :project-end-date="calendarLimits.calendarEndDate" :scale="currentScale" />

            <GanttChart :scale="currentScale" :row-height="rowHeight" />
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-project-state">
      <p>No hay un proyecto cargado. Por favor, crea uno nuevo o cárgalo.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useProjectStore } from '../../stores/project';
import { useUIStore } from '../../stores/ui';
import { displayStringToDate } from '../../src/models/dateFunc';
import { Scale, getCalendarLimitDates } from './ganttHelpers';

// Accede a los stores de Pinia
const projectStore = useProjectStore();
const uiStore = useUIStore();

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

// Define las propiedades de configuración
const rowHeight = 20; // Altura de cada fila en píxeles

// Propiedades computadas para obtener datos del store
const projectData = computed(() => projectStore.projectData);
const currentScale = computed(() => projectStore.currentScale);
const criticalPathIndex = computed(() => uiStore.criticalPathIndex);

// Calcula los límites de fecha del calendario
const calendarLimits = computed(() => {
  if (!projectData.value || !projectData.value.startDate || !projectData.value.endDate) {
    return { calendarStartDate: new Date(), calendarEndDate: new Date() };
  }
  const projectStartDate = displayStringToDate(projectData.value.startDate);
  const projectEndDate = displayStringToDate(projectData.value.endDate);
  return getCalendarLimitDates(projectStartDate, projectEndDate, currentScale.value);
});
</script>

<style scoped>
.gantt-view {
  display: flex;
  flex-direction: column;
  /*height: 100vh;*/
  overflow: hidden;
}

.gantt-container {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  padding: 10px;
}

.gantt-chart-content {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

.gantt-scrollable-area {
  flex-grow: 1;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
}
</style>