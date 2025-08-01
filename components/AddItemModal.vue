<template>
  <VueFinalModal 
    :model-value="uiStore.addModalVisible"
    :lock-scroll="true"
    :click-to-close="false"
    :esc-to-close="true"
    :teleport-to="'body'"
    overlay-class="modal-overlay"
    content-class="modal-content"
    @before-open="beforeOpen"
    @closed="uiStore.closeAddModal()"
  >
    <div class="modal-header">
      <h5 class="modal-title">{{ projectStore.isEditing ? 'Editar' : 'Agregar' }} Item</h5>
      <button type="button" class="btn-close" aria-label="Close" @click="uiStore.closeAddModal()"></button>
    </div>
    
    <div class="modal-body">
      <ItemForm />
      
      <div class="mt-3 d-flex justify-content-end">
        <button type="button" class="btn btn-secondary me-2" @click="uiStore.closeAddModal()">Cancelar</button>
        <button type="button" class="btn btn-primary" @click="formItemStore.submitForm()">Guardar</button>
      </div>
    </div>
  </VueFinalModal>
</template>

<script setup>
import { VueFinalModal } from 'vue-final-modal';
import { useUIStore } from '../stores/ui';
import { useProjectStore } from '../stores/project';
import { useFormItemStore } from '../stores/formItem';

const uiStore = useUIStore();
const projectStore = useProjectStore();
const formItemStore = useFormItemStore();

// Esta función ahora contiene la lógica para preparar el formulario
const beforeOpen = () => {
  if (projectStore.itemForEdit) {
    // Si estamos en modo edición, cargamos los datos del item
    const item = projectStore.controller.getProject().getItemById(projectStore.itemForEdit);
    console.log(item)
    formItemStore.loadFormForEdit(item);
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