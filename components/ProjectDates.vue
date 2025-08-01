<template>
  <div class="container mb-3">
    <div>
      <strong>Inicio del proyecto:</strong>
      <span>{{ formatDate(projectStore.projectStartDate) }}</span>
    </div>
    <div>
      <strong>Final del proyecto:</strong>
      <span>{{ formatDate(projectStore.projectEndDate) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '../stores/project'

const projectStore = useProjectStore()

const formatDate = (date: Date) => {
  return date.toLocaleDateString('es-ES')
}
</script>