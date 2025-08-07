<template>
  <div class="project-loader">
    <button
      class="btn btn-outline-secondary btn-sm"
      @click="triggerFileInput"
    >
      📂 Cargar Proyecto
    </button>

    <!-- Input oculto para cargar archivos -->
    <input
      type="file"
      accept=".json,.jlprj"
      style="display: none"
      ref="fileInput"
      @change="handleFileLoad"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProjectStore } from '../../stores/project'; // Ajusta la ruta a tu store
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

      // Una vez cargado, obtén el ID del proyecto y navega
      const projectId = projectStore.controller.getProject().getId();
      if (projectId) {
        navigateTo(`/project/${projectId}`); // Navega a la ruta dinámica
      } else {
        console.warn('El proyecto cargado no tiene un ID válido para la navegación.');
        // Opcional: manejar el caso de un ID no válido, quizás redirigir a una página de error o a la raíz
      }
    } catch (error) {
      console.error('Error al cargar el proyecto:', error);
      // Aquí puedes mostrar un mensaje de error al usuario, por ejemplo, con un toast o un modal.
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