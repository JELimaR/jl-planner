<template>
  <div class="gantt-svg-container" :style="{ width: `${svgWidth}px` }">
    <svg :width="svgWidth" :height="svgHeight" id="gantt-svg">
      <defs>
        <marker id="arrowhead" markerWidth="7" markerHeight="4" refX="7" refY="2" orient="auto"
          markerUnits="strokeWidth">
          <path d="M0,0 L10,3.5 L0,7 Z" fill="#333" />
        </marker>
      </defs>

      <g class="gantt-items-group">
        <GanttItem v-for="(item, index) in flattenedItems" :key="item.id" :item="item" :row-index="index"
          :row-height="rowHeight" :project-data="projectData" :critical-path-index="criticalPathIndex"
          :calendar-start-date="calendarLimits.calendarStartDate" :scale="scale" />
      </g>

      <g class="gantt-arrows-group">
        <GanttArrow v-for="(arrow, index) in arrows" :key="index" :source="arrow.source" :target="arrow.target"
          :row-height="rowHeight" :is-critical="arrow.isCritical" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { flattenItemsList, useProjectStore } from '../../stores/project';
import { useUIStore } from '../../stores/ui';
import { SCALE_OPTIONS, Scale, getXPositionEnd, getXPositionStart, isCriticalArrow, getCalendarLimitDates } from './ganttHelpers';
import type { IProjectData } from '../../src/models/Project';
import { DAY_MS, displayStringToDate } from '../../src/models/dateFunc';

const projectStore = useProjectStore();
const uiStore = useUIStore();

// Define las props que el componente padre pasará
const props = defineProps<{
  scale: Scale;
  rowHeight: number;
  calendarStartDate: Date;
  calendarEndDate: Date;
}>();

// Propiedades computadas para la visualización de los datos
const projectData = computed(() => projectStore.projectData as IProjectData);
const criticalPathIndex = computed(() => uiStore.criticalPathIndex);
const flattenedItems = computed(() => flattenItemsList(projectData.value.items));

// Usar las fechas del calendario pasadas como props
const calendarLimits = computed(() => ({
  calendarStartDate: props.calendarStartDate,
  calendarEndDate: props.calendarEndDate
}));

// Calcula el ancho y alto del SVG
const svgWidth = computed(() => {
  const start = calendarLimits.value.calendarStartDate;
  const end = calendarLimits.value.calendarEndDate;
  const totalDays = (end.getTime() - start.getTime()) / (DAY_MS);
  return totalDays * SCALE_OPTIONS[props.scale].pxPerDay;
});
const svgHeight = computed(() => flattenedItems.value.length * props.rowHeight);

// Lógica para generar los datos de las flechas
const arrows = computed(() => {
  const arrowsData: { source: { x: number; y: number }; target: { x: number; y: number }; isCritical: boolean }[] = [];
  const itemPositions = new Map<number, { startX: number; endX: number; y: number }>();

  flattenedItems.value.forEach((item, index) => {
    const startX = getXPositionStart(item, calendarLimits.value.calendarStartDate, props.scale);
    const endX = getXPositionEnd(item, calendarLimits.value.calendarStartDate, props.scale);
    const centerY = index * props.rowHeight + props.rowHeight / 2;
    itemPositions.set(item.id, { startX, endX, y: centerY });
  });

  flattenedItems.value.forEach((item) => {
    if (item.predecessorIds) {
      for (const predId of item.predecessorIds) {
        const pred = flattenedItems.value.find(i => i.id === predId);
        if (pred) {
          const sourcePos = itemPositions.get(pred.id);
          const targetPos = itemPositions.get(item.id);

          if (sourcePos && targetPos && pred.type != 'process' && item.type != 'process') {
            const isCrit = isCriticalArrow(projectData.value, pred, item, uiStore.criticalPathIndex);
            arrowsData.push({
              source: { x: sourcePos.endX, y: sourcePos.y },
              target: { x: targetPos.startX, y: targetPos.y },
              isCritical: isCrit,
            });
          }
        }
      }
    }
  });

  return arrowsData;
});
</script>

<style scoped>
.gantt-svg-container {
  min-width: 100%;
}
</style>
