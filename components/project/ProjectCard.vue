<template>
  <NuxtLink 
    :to="`/project/${project.id}`" 
    class="list-group-item list-group-item-action"
    :class="{ 'border-primary': true }"
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
      <div class="dropdown ms-2" @click.prevent>
        <button 
          class="btn btn-sm btn-outline-secondary dropdown-toggle" 
          type="button" 
          :id="`dropdown-${project.id}`"
          data-bs-toggle="dropdown" 
          aria-expanded="false"
        >
          <i class="bi bi-three-dots-vertical"></i>
        </button>
        <ul class="dropdown-menu" :aria-labelledby="`dropdown-${project.id}`">
          <li>
            <button class="dropdown-item" @click="editProject(project)">
              <i class="bi bi-pencil"></i> Editar
            </button>
          </li>
          <li>
            <button class="dropdown-item" @click="duplicateProject(project)">
              <i class="bi bi-files"></i> Duplicar
            </button>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <button class="dropdown-item text-danger" @click="deleteProject(project)">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </li>
        </ul>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { IProjectData } from '../../src/models/Project';

// Props
interface Props {
  project: IProjectData;
}
const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'edit-project': [project: IProjectData];
  'delete-project': [project: IProjectData];
  'duplicate-project': [project: IProjectData];
}>();

// Métodos para emitir eventos
const editProject = (project: IProjectData) => {
  emit('edit-project', project);
};
const deleteProject = (project: IProjectData) => {
  emit('delete-project', project);
};
const duplicateProject = (project: IProjectData) => {
  emit('duplicate-project', project);
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