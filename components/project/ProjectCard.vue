<template>
  <NuxtLink
    to="project"
    class="list-group-item list-group-item-action border-secondary"
    @click="handleTemplateClick"
  >
    <div class="d-flex w-100 justify-content-between align-items-start">
      <div class="flex-grow-1">
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">{{ project.title || 'Sin título' }}</h6>
          </div>
        <p class="mb-1 text-muted">{{ project.subtitle || 'Sin descripción' }}</p>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">ID: {{ project.id }}</small>
          <div class="d-flex gap-2">
            </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { IProjectHeader } from '../../src/models/Project';
import { useProjectStore } from '../../stores/project';
import { navigateTo } from 'nuxt/app';

// Props
interface Props {
  project: IProjectHeader;
}
const props = defineProps<Props>();

const projectStore = useProjectStore();

// Método para manejar el clic en el proyecto
const handleTemplateClick = async () => {
  // Cargar el proyecto basado en el ID de la plantilla
  await projectStore.getTemplate(props.project.id);
  // Navegar a la página del proyecto
  navigateTo('/project');
};
</script>

<style scoped>
.list-group-item {
  transition: all 0.2s ease;
}
.list-group-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.dropdown-toggle::after {
  display: none;
}
</style>