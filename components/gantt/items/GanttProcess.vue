<template>
  <g class="gantt-process">
    <rect
      :x="x"
      :y="y"
      :width="width"
      :height="barHeight"
      :fill="color"
      rx="3"
      ry="3"
    />
    <path :d="bracketPath" :fill="color" stroke="none" />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IProcessData } from '../../../src/models/Process';
import { IProjectData } from '../../../src/models/Project';
import { displayStringToDate } from '../../../src/models/dateFunc';
import { CRITICAL_COLOR } from '../../../src/views/colors';
import { getTimeUnitsBetween, SCALE_OPTIONS, isCritical, Scale } from '../ganttHelpers';

const props = defineProps<{
  item: IProcessData;
  rowIndex: number;
  rowHeight: number;
  projectData: IProjectData;
  criticalPathIndex: number | undefined;
  calendarStartDate: Date;
  scale: Scale;
}>();

const barHeight = 5;
const triangleSize = 8;
const offset = 0.35;

const x = computed(() => {
  const start = displayStringToDate(props.item.startDate);
  return (getTimeUnitsBetween(props.calendarStartDate, start, 'day') - offset) * SCALE_OPTIONS[props.scale].pxPerDay;
});

const y = computed(() => {
  return props.rowIndex * props.rowHeight + props.rowHeight / 2 - barHeight / 2;
});

const width = computed(() => {
  const start = displayStringToDate(props.item.startDate);
  const end = displayStringToDate(props.item.endDate);
  if (!start || !end) return 0;
  return (getTimeUnitsBetween(start, end, 'day') + 2 * offset) * SCALE_OPTIONS[props.scale].pxPerDay;
});

const color = computed(() => {
  return isCritical(props.projectData, props.item, props.criticalPathIndex) ? CRITICAL_COLOR : props.item.color || '#666';
});

const bracketPath = computed(() => {
  const xStart = x.value;
  const xEnd = x.value + width.value;
  const yBase = y.value + barHeight / 2;
  const yTip = yBase + triangleSize;
  const triangleOffset = triangleSize / 2.5;

  const leftTriangle = [[xStart, yBase], [xStart + triangleSize, yBase], [xStart + triangleOffset, yTip]];
  const rightTriangle = [[xEnd - triangleSize, yBase], [xEnd, yBase], [xEnd - triangleOffset, yTip]];
  const middleLine = [[xStart + triangleSize, yBase], [xEnd - triangleSize, yBase]];

  let d = `M ${leftTriangle[0].join(',')} L ${leftTriangle[1].join(',')} L ${leftTriangle[2].join(',')} Z `;
  d += `M ${rightTriangle[0].join(',')} L ${rightTriangle[1].join(',')} L ${rightTriangle[2].join(',')} Z `;
  d += `M ${middleLine[0].join(',')} L ${middleLine[1].join(',')}`;

  return d;
});
</script>