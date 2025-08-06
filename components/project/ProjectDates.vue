<template>
  <div class="container mb-3">
    <div>
      <strong>Inicio del proyecto: </strong>
      <span>{{ formatDateToDisplay(projectStore.projectStartDate) }}</span>
    </div>
    <div>
      <strong>Final del proyecto: </strong>
      <span>{{ formatDateToDisplay(projectStore.projectEndDate) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateToDisplay } from '../../src/models/dateFunc';
import { useProjectStore } from '../../stores/project'

const projectStore = useProjectStore()

</script>