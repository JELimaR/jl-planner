<template>
  <rect
    :x="x"
    :y="y"
    :width="width"
    :height="height"
    :fill="color"
    rx="5"
    ry="5"
    class="gantt-task"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ITaskData } from '../../../src/models/Task';
import { IProjectData } from '../../../src/models/Project';
import { displayStringToDate } from '../../../src/models/dateFunc';
import { SCALE_OPTIONS, Scale, getTimeUnitsBetween, isCritical } from '../ganttHelpers';
import { CRITICAL_COLOR } from '../../../src/views/colors';

const props = defineProps<{
  item: ITaskData;
  rowIndex: number;
  rowHeight: number;
  projectData: IProjectData;
  criticalPathIndex: number | undefined;
  calendarStartDate: Date;
  scale: Scale;
}>();

const height = 10;

const x = computed(() => {
  const start = displayStringToDate(props.item.startDate);
  return getTimeUnitsBetween(props.calendarStartDate, start, 'day') * SCALE_OPTIONS[props.scale].pxPerDay;
});

const y = computed(() => {
  return props.rowIndex * props.rowHeight + props.rowHeight / 2 - height / 2;
});

const width = computed(() => {
  const start = displayStringToDate(props.item.startDate);
  const end = displayStringToDate(props.item.endDate);
  if (!start || !end) return 0;
  return getTimeUnitsBetween(start, end, 'day') * SCALE_OPTIONS[props.scale].pxPerDay;
});

const color = computed(() => {
  return isCritical(props.projectData, props.item, props.criticalPathIndex) ? CRITICAL_COLOR : props.item.color || '#FF0000';
});
</script>