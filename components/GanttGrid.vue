<template>
  <div class="gantt-grid" :style="{ height: `${totalHeight}px` }">
    <div 
      v-for="(tick, index) in ticks" 
      :key="index"
      class="gantt-grid-column"
      :style="{ 
        width: `${tickWidth}px`,
        height: `${totalHeight}px`,
        backgroundColor: isWeekend(tick) ? '#f9f9f9' : 'transparent'
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '../stores/project'
import { getTimeUnitsBetween, SCALE_OPTIONS, type Scale } from '../src/views/ganttHelpers'

interface Props {
  scale: Scale
  startDate: Date
  endDate: Date
}

const props = defineProps<Props>()
const projectStore = useProjectStore()

// Calcular el ancho de cada tick según la escala
const tickWidth = computed(() => {
  const scaleOption = SCALE_OPTIONS[props.scale]
  let daysPerUnit = 1
  if (props.scale === 'week') daysPerUnit = 7
  if (props.scale === 'month') daysPerUnit = 30
  return scaleOption.pxPerDay * daysPerUnit
})

// Obtener el número de unidades de tiempo entre las fechas
const timeUnits = computed(() => 
  getTimeUnitsBetween(props.startDate, props.endDate, props.scale)
)

// Calcular la altura total de la cuadrícula basada en el número de elementos del proyecto
const totalHeight = computed(() => {
  let count = 0
  projectStore.controller.getProject().traverse(() => count++)
  return count * 30 // 30px por fila
})

// Generar los ticks para la cuadrícula
const ticks = computed(() => {
  const result: Date[] = []
  for (let i = 0; i < timeUnits.value; i++) {
    const date = getTickDate(props.startDate, i, props.scale)
    result.push(date)
  }
  return result
})

// Funciones auxiliares
function getTickDate(start: Date, index: number, scale: Scale): Date {
  const date = new Date(start)
  if (scale === 'day') date.setDate(date.getDate() + index)
  if (scale === 'week') date.setDate(date.getDate() + index * 7)
  if (scale === 'month') date.setMonth(date.getMonth() + index)
  return date
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // 0 es domingo, 6 es sábado
}
</script>

<style scoped>
.gantt-grid {
  position: relative;
  display: flex;
}

.gantt-grid-column {
  border-right: 1px solid #eee;
}
</style>