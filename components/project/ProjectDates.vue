<template>
  <div class="container mb-3">
    <div>
      <strong>Inicio del proyecto: </strong>
      <span>{{ formatDate(projectStore.projectStartDate) }}</span>
    </div>
    <div>
      <strong>Final del proyecto: </strong>
      <span>{{ formatDate(projectStore.projectEndDate) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project'

const projectStore = useProjectStore()

const formatDate = (date?: Date): string => {
  if (!date) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript van de 0 a 11
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

</script>