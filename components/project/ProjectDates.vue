<template>
  <div class="container mb-3">
    <div>
      <strong>Inicio del proyecto: </strong>
      <span>{{ projectStore.projectStartDate }}</span>
    </div>
    <div>
      <strong>Final del proyecto: </strong>
      <span>{{ projectStore.projectEndDate }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project'

const projectStore = useProjectStore()

</script>