<template>
  <div class="modal fade" tabindex="-1" ref="modalRef">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Eliminar Item</h5>
          <button class="btn-close" aria-label="Close" @click="uiStore.closeDeleteModal()"></button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de eliminar este item?</p>
          <button
            type="button"
            class="btn btn-sm btn-danger"
            @click="confirmDelete"
          >
            Sí, eliminar
          </button>
          <button
            type="button"
            class="btn btn-sm btn-secondary"
            @click="uiStore.closeDeleteModal()"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProjectStore } from '../stores/project'
import { useUIStore } from '../stores/ui'

const projectStore = useProjectStore()
const uiStore = useUIStore()

const modalRef = ref<HTMLElement>()

const confirmDelete = () => {
  projectStore.deleteItem()
  uiStore.closeDeleteModal()
}

defineExpose({
  modalRef
})
</script>