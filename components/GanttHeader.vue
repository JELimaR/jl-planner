<template>
  <div class="gantt-header">
    <div class="gantt-year-row">
      <div 
        v-for="(yearBlock, index) in yearBlocks" 
        :key="index"
        class="gantt-year-block"
        :style="{ width: `${(yearBlock as { width: number }).width}px` }"
      >
        {{ yearBlock.year }}
      </div>
    </div>
    <div class="gantt-tick-row">
      <div 
        v-for="(tick, index) in ticks" 
        :key="index"
        class="gantt-tick"
        :style="{ width: `${tickWidth}px` }"
      >
        {{ tick.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getTimeUnitsBetween, SCALE_OPTIONS, type Scale } from '../src/views/ganttHelpers'

interface Props {
  scale: Scale
  startDate: Date
  endDate: Date
}

const props = defineProps<Props>()

// Calcular el ancho de cada tick según la escala
const tickWidth = computed(() => {
  const scaleConfig = SCALE_OPTIONS[props.scale]
  let daysPerUnit = 1 // Default for day scale
  
  if (props.scale === 'week') {
    daysPerUnit = 7
  } else if (props.scale === 'month') {
    daysPerUnit = 30 // Approximate days per month //NOO
  }

  return scaleConfig.pxPerDay * daysPerUnit
})

// Obtener el número de unidades de tiempo entre las fechas
const timeUnits = computed(() => 
  getTimeUnitsBetween(props.startDate, props.endDate, props.scale)
)

// Generar los ticks para la fila de fechas
const ticks = computed(() => {
  const result: {date: Date, label: string}[] = []
  for (let i = 0; i < timeUnits.value; i++) {
    const date = getTickDate(props.startDate, i, props.scale)
    result.push({
      date,
      label: formatTickLabel(date, props.scale)
    })
  }
  return result
})

// Generar los bloques de años
const yearBlocks = computed(() => {
  const result: {year: number, width: number}[] = []
  let currentYear = props.startDate.getFullYear()
  let currentYearStart = 0
  
  ticks.value.forEach((tick, index) => {
    const tickYear = tick.date.getFullYear()
    if (tickYear !== currentYear || index === ticks.value.length - 1) {
      // Añadir el bloque del año anterior
      result.push({
        year: currentYear,
        width: (index - currentYearStart) * tickWidth.value
      })
      
      // Preparar para el siguiente año
      currentYear = tickYear
      currentYearStart = index
    }
  })
  
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

function formatTickLabel(date: Date, scale: Scale): string {
  if (scale === 'day') {
    return `${formatToTwoDigits(date.getDate())}.${formatToTwoDigits(date.getMonth() + 1)}`
  }
  if (scale === 'week') {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1)) // Lunes
    return startOfWeek.toLocaleString('es-ES', { day: 'numeric', month: 'short' })
  }
  if (scale === 'month') {
    return date.toLocaleString('es-ES', { month: 'short' })
  }
  return ''
}

function formatToTwoDigits(num: number): string {
  return num < 10 ? `0${num}` : num.toString()
}
</script>

<style scoped>
.gantt-header {
  border-bottom: 1px solid #ddd;
}

.gantt-year-row {
  display: flex;
  height: 25px;
  border-bottom: 1px solid #ddd;
}

.gantt-year-block {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border-right: 1px solid #ddd;
}

.gantt-tick-row {
  display: flex;
  height: 25px;
}

.gantt-tick {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  border-right: 1px solid #ddd;
}
</style>