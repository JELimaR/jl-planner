<template>
  <g class="gantt-milestone-group">
    <polygon
      :points="points"
      :fill="color"
      stroke="#000"
      stroke-width="1"
      class="gantt-milestone"
    />
    <text
      :x="x + 15"
      :y="y + 4"
      fill="#333"
      font-size="10px"
      font-family="monospace"
      class="gantt-milestone-label"
    >
      {{ item.name }}
    </text>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IMilestoneData } from '../../../src/models/Milestone';
import { IProjectData } from '../../../src/models/Project';
import { SCALE_OPTIONS, Scale, getTimeUnitsBetween, isCritical } from '../ganttHelpers';
import { displayStringToDate } from '../../../src/models/dateFunc';
import { CRITICAL_COLOR } from '../../../src/views/colors';

const props = defineProps<{
  item: IMilestoneData;
  rowIndex: number;
  rowHeight: number;
  projectData: IProjectData;
  criticalPathIndex: number | undefined;
  calendarStartDate: Date;
  scale: Scale;
}>();

const size = 6;

const x = computed(() => {
  const start = displayStringToDate(props.item.startDate);
  return getTimeUnitsBetween(props.calendarStartDate, start, 'day') * SCALE_OPTIONS[props.scale].pxPerDay;
});

const y = computed(() => {
  return props.rowIndex * props.rowHeight + props.rowHeight / 2;
});

const points = computed(() => {
  return [
    [x.value, y.value - size],
    [x.value + size, y.value],
    [x.value, y.value + size],
    [x.value - size, y.value],
  ].map(p => p.join(',')).join(' ');
});

const color = computed(() => {
  return isCritical(props.projectData, props.item, props.criticalPathIndex) ? CRITICAL_COLOR : props.item.color || '#d9534f';
});
</script>