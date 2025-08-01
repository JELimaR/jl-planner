<template>
  <div class="modal fade" tabindex="-1" ref="modalRef">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ projectStore.isEditing ? 'Editar' : 'Agregar' }} Item</h5>
          <button type="button" class="btn-close" aria-label="Close" @click="uiStore.closeAddModal()"></button>
        </div>
        <div class="modal-body">
          <form id="addForm"></form>
          <div class="mt-3 d-flex justify-content-end">
            <button type="button" class="btn btn-secondary me-2" @click="uiStore.closeAddModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="projectStore.addNewItem()">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useProjectStore } from '../stores/project'
import { useUIStore } from '../stores/ui'
import { setupAddFormHTML } from '../src/controllers/setupAddItemForm'

const projectStore = useProjectStore()
const uiStore = useUIStore()

const modalRef = ref<HTMLElement>()

// Observar cambios en la visibilidad del modal
watch(() => uiStore.addModalVisible, (visible) => {
  if (modalRef.value) {
    if (visible) {
      // Configurar el formulario cuando se abre el modal
      const form = document.getElementById('addForm') as HTMLFormElement
      if (form) {
        setupAddFormHTML(form, projectStore.controller.getProject())
      }
    }
  }
})

defineExpose({
  modalRef
})
</script>