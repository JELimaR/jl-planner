<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h1 class="text-center mb-4">Planner</h1>
        <p class="text-center text-muted mb-5">Gestión de proyectos con diagramas de Gantt</p>
        
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Proyectos</h5>
            
            <!-- Lista de proyectos (por ahora solo uno) -->
            <div class="list-group">
              <NuxtLink to="/project" class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1">Proyecto Principal</h6>
                  <small>Último acceso: {{ new Date().toLocaleDateString() }}</small>
                </div>
                <p class="mb-1">Proyecto de ejemplo con tareas y milestones.</p>
                <small>ID: project-001</small>
              </NuxtLink>
            </div>
            
            <!-- Botones de acción -->
            <div class="mt-3">
              <button class="btn btn-primary me-2" @click="createNewProject">
                <i class="bi bi-plus-circle"></i> Nuevo Proyecto
              </button>
              <button class="btn btn-outline-secondary" @click="importProject">
                <i class="bi bi-upload"></i> Importar Proyecto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const createNewProject = () => {
  try {
    // Por ahora redirigir al proyecto principal
    // En el futuro, crear un nuevo proyecto con ID único
    const router = useRouter();
    router.push('/project');
  } catch (error) {
    console.error('Error creating new project:', error);
  }
};

const importProject = () => {
  try {
    // Implementar lógica de importación
    console.log('Import project functionality to be implemented');
  } catch (error) {
    console.error('Error importing project:', error);
  }
};
</script>