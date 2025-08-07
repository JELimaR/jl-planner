<template>
  <VueFinalModal
    :model-value="uiStore.deleteModalVisible"
    :lock-scroll="true"
    :click-to-close="true"
    :esc-to-close="true"
    :teleport-to="'body'"
    overlay-class="modal-overlay"
    content-class="modal-content"
    @closed="closeDeleteModal"
  >
    <div class="modal-header">
      <h5 class="modal-title">Eliminar Item</h5>
      <button class="btn-close" aria-label="Close" @click="closeDeleteModal"></button>
    </div>
    <div class="modal-body">
      <p>¿Estás seguro de eliminar este item?</p>
      
      <div class="d-flex justify-content-end mt-3">
        <button
          type="button"
          class="btn btn-sm btn-secondary me-2"
          @click="closeDeleteModal"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-sm btn-danger"
          @click="confirmDelete"
        >
          Sí, eliminar
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>

<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal';
import { useProjectStore } from '../../stores/project';
import { useUIStore } from '../../stores/ui';

const projectStore = useProjectStore();
const uiStore = useUIStore()

const confirmDelete = () => {
  projectStore.deleteItem();
  closeDeleteModal()
};

const closeDeleteModal = () => {
  projectStore.itemToDelete = null;
  uiStore.closeDeleteModal()
}
</script>

<style scoped>
/* Los estilos del modal de Bootstrap se pueden reutilizar o adaptar */
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