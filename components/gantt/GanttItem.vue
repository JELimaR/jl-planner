<template>
  <GanttTask
    v-if="item.type === 'task'"
    :item="item"
    :row-index="rowIndex"
    :row-height="rowHeight"
    :project-data="projectData"
    :critical-path-index="criticalPathIndex"
    :calendar-start-date="calendarStartDate"
    :scale="scale"
  />
  <GanttMilestone
    v-else-if="item.type === 'milestone'"
    :item="item"
    :row-index="rowIndex"
    :row-height="rowHeight"
    :project-data="projectData"
    :critical-path-index="criticalPathIndex"
    :calendar-start-date="calendarStartDate"
    :scale="scale"
  />
  <GanttProcess
    v-else-if="item.type === 'process'"
    :item="item"
    :row-index="rowIndex"
    :row-height="rowHeight"
    :project-data="projectData"
    :critical-path-index="criticalPathIndex"
    :calendar-start-date="calendarStartDate"
    :scale="scale"
  />
</template>

<script setup lang="ts">
import type { IItemData } from '../../src/models/Item';
import type { IProjectData } from '../../src/models/Project';
import type { Scale } from './ganttHelpers';

// Define las propiedades que este componente recibirá
const props = defineProps<{
  item: IItemData;
  rowIndex: number;
  rowHeight: number;
  projectData: IProjectData;
  criticalPathIndex: number | undefined;
  calendarStartDate: Date;
  scale: Scale;
}>();
</script>