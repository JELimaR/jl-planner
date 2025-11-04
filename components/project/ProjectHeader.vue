<template>
  <div id="project-header" class="container my-4">
    <div class="text-center">
      <h1 id="project-title" class="mb-2">{{ projectStore.projectTitle }}</h1>
      <p v-if="projectStore.projectSubtitle" id="project-subtitle" class="text-muted lead">{{ projectStore.projectSubtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project';

const projectStore = useProjectStore();
</script>

<style scoped>
#project-title {
  color: #2c3e50;
  font-weight: 700;
}

#project-subtitle {
  font-size: 1.1rem;
  margin-bottom: 0;
}
</style>