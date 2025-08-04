<template>
  <div class="gantt-items">
    <svg :width="totalWidth" :height="totalHeight" class="gantt-svg">
      <!-- Elementos del proyecto -->
      <template v-for="(item, index) in items" :key="item.id">
        <!-- Milestone -->
        <g v-if="item.type === 'milestone'" :transform="`translate(${getItemX(item)}, ${getItemY(index)})`">
          <polygon 
            :points="getMilestonePoints(getItemX(item), getItemY(index))"
            :fill="item.isCritical ? criticalColor : processColors[item.processId] || '#666'"
          />
          <text 
            :x="6" 
            :y="0" 
            dominant-baseline="middle"
            font-size="12"
          >{{ item.name }}</text>
        </g>
        
        <!-- Task -->
        <g v-else-if="item.type === 'task'" :transform="`translate(${getItemX(item)}, ${getItemY(index)})`">
          <rect 
            :width="getItemWidth(item)"
            :height="20"
            :y="-10"
            :fill="item.isCritical ? criticalColor : processColors[item.processId] || '#666'"
            rx="3"
            ry="3"
          />
          <text 
            :x="5" 
            :y="0" 
            dominant-baseline="middle"
            font-size="12"
            fill="white"
          >{{ item.name }}</text>
        </g>
        
        <!-- Process -->
        <g v-else-if="item.type === 'process'" :transform="`translate(${getItemX(item)}, ${getItemY(index)})`">
          <rect 
            :width="getItemWidth(item)"
            :height="20"
            :y="-10"
            :fill="processColors[item.id] || '#666'"
            fill-opacity="0.3"
            rx="3"
            ry="3"
            stroke="#666"
            stroke-width="1"
          />
          <text 
            :x="5" 
            :y="0" 
            dominant-baseline="middle"
            font-size="12"
          >{{ item.name }}</text>
        </g>
      </template>
      
      <!-- Flechas de dependencias -->
      <!-- Implementar las flechas de dependencias aquí -->
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CRITICAL_COLOR, processColorMap } from '../../src/views/colors'
import { getTimeUnitsBetween, SCALE_OPTIONS, type Scale } from '../../src/views/ganttHelpers'
import type { Item } from '../../src/models/Item'

interface Props {
  items: any[] // Usar el tipo correcto para los items
  scale: Scale
  startDate: Date
}

const props = defineProps<Props>()

// Colores
const criticalColor = CRITICAL_COLOR
const processColors = computed(() => processColorMap)

// Calcular el ancho de cada unidad de tiempo según la escala
const unitWidth = computed(() => SCALE_OPTIONS[props.scale].pxPerDay)

// Calcular el ancho total del SVG
const totalWidth = computed(() => {
  const lastItem = [...props.items].sort((a, b) => 
    new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
  )[0]
  
  if (!lastItem) return 1000
  
  const endDate = new Date(lastItem.endDate)
  const timeUnits = getTimeUnitsBetween(props.startDate, endDate, props.scale)
  return timeUnits * unitWidth.value + 100 // Add margin
})

// Calcular la altura total del SVG
const totalHeight = computed(() => props.items.length * 30) // 30px por fila

// Funciones para calcular posiciones y dimensiones
function getItemX(item: any): number {
  const startDate = new Date(item.startDate)
  const diffDays = Math.floor((startDate.getTime() - props.startDate.getTime()) / (24 * 60 * 60 * 1000))
  return diffDays * unitWidth.value
}

function getItemY(index: number): number {
  return index * 30 + 15 // 30px por fila, centrado verticalmente
}

function getItemWidth(item: any): number {
  if (item.type === 'milestone') return 0
  
  const startDate = new Date(item.startDate)
  const endDate = new Date(item.endDate)
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
  return durationDays * unitWidth.value
}

function getMilestonePoints(x: number, y: number): string {
  const size = 6 // tamaño del rombo
  return [
    [x, y - size], // arriba
    [x + size, y], // derecha
    [x, y + size], // abajo
    [x - size, y], // izquierda
  ].map(p => p.join(',')).join(' ')
}
</script>

<style scoped>
.gantt-items {
  position: relative;
}

.gantt-svg {
  position: absolute;
  top: 0;
  left: 0;
}
</style>