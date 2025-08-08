<template>
  <VueFinalModal 
    :model-value="uiStore.addModalVisible"
    :lock-scroll="true"
    :click-to-close="true"
    :esc-to-close="true"
    :teleport-to="'body'"
    overlay-class="modal-overlay"
    content-class="modal-content"
    @before-open="beforeOpen"
    @closed="close()"
  >
    <div class="modal-header">
      <h5 class="modal-title">{{ projectStore.itemToEdit ? `Editar (#${projectStore.itemToEdit.id} - ${ projectStore.itemToEdit.name })` : 'Agregar' }} </h5>
      <button type="button" class="btn-close" aria-label="Close" @click="close()"></button>
    </div>
    
    <div class="modal-body">
      <ItemForm />

    </div>
  </VueFinalModal>
</template>

<script setup>
import { VueFinalModal } from 'vue-final-modal';
import { useUIStore } from '../../stores/ui';
import { useProjectStore } from '../../stores/project';
import { useFormItemStore } from '../../stores/formItem';

const uiStore = useUIStore();
const projectStore = useProjectStore();
const formItemStore = useFormItemStore();

// cerrar el modal
const close = () => {
  uiStore.closeAddModal()
  formItemStore.resetForm()
}

// Esta función ahora contiene la lógica para preparar el formulario
const beforeOpen = () => {
  if (projectStore.itemToEdit) { // Usa itemToEdit en lugar de itemForEdit
    // Si estamos en modo edición, cargamos los datos del item
    formItemStore.loadFormForEdit(projectStore.itemToEdit);
  } else {
    // Si estamos en modo agregar, reseteamos el formulario
    formItemStore.resetForm();
  }
};
</script>

<style>
/* Estilos para el modal, puedes ajustarlos a tus necesidades */
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 0;
  overflow-y: auto;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}
.btn-close {
  cursor: pointer;
  border: none;
  background: transparent;
  font-size: 1.5rem;
}
</style>