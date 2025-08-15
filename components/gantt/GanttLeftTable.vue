<template>
  <div class="gantt-labels">
    <div class="gantt-label-header">
      <div class="header-cell" style="width: 280px">Tarea</div>
      <div class="header-cell" style="width: 90px">Inicio</div>
      <div class="header-cell" style="width: 40px; font-size: 11px">delay</div>
    </div>
    
    <div class="gantt-label-items">
      <div
        v-for="({ item, depth }, index) in flattenedItems"
        :key="item.id"
        class="label-row"
        :style="{ height: `${rowHeight}px` }"
      >
        <div class="label-cell" :style="{ width: '280px', color: isCritical(projectData, item, -1) ? CRITICAL_COLOR : 'black', paddingLeft: `${1+depth * 5}px` }">
          {{ item.name }}
        </div>
        
        <div class="label-cell" :style="{width: '90px', color: isCritical(projectData, item, -1) ? CRITICAL_COLOR : 'black'}">
          {{ item.startDate || '-' }}
        </div>
        
        <div 
          class="label-cell" 
          style="font-size: 11px; font-weight: bold;"
          :style="{ width: '30px', color: getDelayInDays(item) !== 0 ? 'red' : 'inherit' }"
        >
          {{ getDelayInDays(item) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { flattenItemsListWithDepth } from '../../stores/project';
import { CRITICAL_COLOR } from '../../src/views/colors';
import { IProjectData } from '../../src/models/Project';
import { getDelayInDays, isCritical } from './ganttHelpers';

const props = defineProps<{
  projectData: IProjectData;
  rowHeight: number;
  criticalPathIndex: number | undefined;
}>();

const flattenedItems = computed(() => flattenItemsListWithDepth(props.projectData.items));

</script>

<style scoped>
.gantt-labels {
  display: flex;
  flex-direction: column;
  font-family: sans-serif;
}

.gantt-label-header, .label-row {
  display: flex;
  font-size: 12px;
  border-bottom: 1px solid #eee;
  padding: 0 5px;
}

.header-cell, .label-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 5px;
  display: flex;
  align-items: center;
}

.gantt-label-header {
  font-weight: bold;
}
</style>