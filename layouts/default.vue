<template>
  <div>
    <div id="project-header" class="container my-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 id="project-title" class="mb-0">{{ projectStore.controller.getProject().getTitle() }}</h1>
          <p id="project-subtitle" class="text-muted">{{ projectStore.controller.getProject().getSubtitle() }}</p>
        </div>
        <button
          id="edit-title-button"
          class="btn btn-outline-secondary btn-sm"
          title="Editar título del proyecto"
          @click="openEditModal"
        >
          ✏️ Editar
        </button>
      </div>
    </div>

    <VueFinalModal
      :model-value="editModalVisible"
      :lock-scroll="true"
      :teleport-to="'body'"
      overlay-class="modal-overlay"
      content-class="modal-content"
      @closed="closeEditModal"
    >
      <div class="modal-header">
        <h5 class="modal-title">Editar</h5>
        <button type="button" class="btn-close" aria-label="Close" @click="closeEditModal"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label for="project-title-input" class="form-label">Título del proyecto</label>
          <input
            type="text"
            class="form-control"
            id="project-title-input"
            v-model="editTitle"
            placeholder="Ingrese el título del proyecto"
          />
        </div>
        <div class="mb-3">
          <label for="project-subtitle-input" class="form-label">Subtítulo (opcional)</label>
          <input
            type="text"
            class="form-control"
            id="project-subtitle-input"
            v-model="editSubtitle"
            placeholder="Ingrese el subtítulo del proyecto"
          />
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeEditModal">
          Cancelar
        </button>
        <button type="button" class="btn btn-primary" @click="saveTitle">
          Guardar
        </button>
      </div>
    </VueFinalModal>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueFinalModal } from 'vue-final-modal';
import { useProjectStore } from '../stores/project';

const projectStore = useProjectStore();

// Estado local para controlar la visibilidad del modal
const editModalVisible = ref(false);

// Refs locales para los campos del formulario
const editTitle = ref('');
const editSubtitle = ref('');

// Funciones para gestionar el modal
const openEditModal = () => {
  // Sincronizamos los refs locales con los valores del store antes de abrir el modal
  editTitle.value = projectStore.controller.getProject().getTitle();
  editSubtitle.value = projectStore.controller.getProject().getSubtitle();
  editModalVisible.value = true;
};

const closeEditModal = () => {
  editModalVisible.value = false;
};

// Función para guardar los cambios
const saveTitle = () => {
  // Llamamos a la acción del store para actualizar los datos
  projectStore.saveTitle(editTitle.value, editSubtitle.value);
  closeEditModal();
};
</script>

<style scoped>
/* Estilos para el modal */
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.btn-close {
  cursor: pointer;
  border: none;
  background: transparent;
  font-size: 1.5rem;
}
</style>