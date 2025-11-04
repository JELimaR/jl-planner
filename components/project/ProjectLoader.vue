<template>
  <div class="project-loader">
    <button
      class="btn btn-outline-secondary btn-sm"
      @click="triggerFileInput"
      style="border-top-left-radius: 0.375rem; border-bottom-left-radius: 0.375rem; border-top-right-radius: 0; border-bottom-right-radius: 0;"
    >
      <i class="bi bi-folder-open me-1"></i>Cargar Proyecto
    </button>

    <!-- Input oculto para cargar archivos -->
    <input
      type="file"
      accept=".json,.jlprj,.prj"
      style="display: none"
      ref="fileInput"
      @change="handleFileLoad"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProjectStore } from '../../stores/project';
import { useToast } from '../../composables/useToast';
import { navigateTo } from 'nuxt/app';

const projectStore = useProjectStore();
const fileInput = ref<HTMLInputElement>();

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileLoad = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    try {
      // Llama a la acción del store para cargar el proyecto desde el archivo
      await projectStore.loadProjectFromFile(file);

      // Mostrar toast de éxito
      const { showSuccess } = useToast()
      showSuccess('Proyecto Cargado', 'El archivo se ha cargado correctamente')
      
      // Navegar a /project/loaded para indicar que hay un proyecto cargado desde archivo
      navigateTo('/project/loaded');
    } catch (error) {
      console.error('Error al cargar el proyecto:', error);
      const { showError } = useToast()
      showError('Error al Cargar', 'No se pudo cargar el archivo del proyecto. Verifica que sea un archivo válido.')
    }
  }
};
</script>

<style scoped>
/* Puedes añadir estilos específicos para este componente aquí si es necesario */
.project-loader {
  display: inline-block; /* Para que el botón no ocupe todo el ancho si está solo */
}
</style>