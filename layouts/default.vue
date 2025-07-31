<template>
  <div>
    <!-- Título del Proyecto -->
    <div id="project-header" class="container my-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 id="project-title" class="mb-0">{{ projectTitle }}</h1>
          <p id="project-subtitle" class="text-muted">{{ projectSubtitle }}</p>
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

    <!-- Modal para editar título y subtítulo -->
    <div id="editTitleModal" class="modal fade" tabindex="-1" ref="editTitleModal">
      <div class="modal-dialog">
        <div class="modal-content">
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
        </div>
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const projectTitle = ref('Proyecto')
const projectSubtitle = ref('')
const editTitle = ref('')
const editSubtitle = ref('')
const editTitleModal = ref<HTMLElement>()

let modalInstance: any = null

const openEditModal = () => {
  editTitle.value = projectTitle.value
  editSubtitle.value = projectSubtitle.value
  modalInstance?.show()
}

const closeEditModal = () => {
  modalInstance?.hide()
}

const saveTitle = () => {
  projectTitle.value = editTitle.value
  projectSubtitle.value = editSubtitle.value
  closeEditModal()
}

onMounted(() => {
  if (process.client) {
    const { $bootstrap } = useNuxtApp()
    modalInstance = $bootstrap.Modal.getOrCreateInstance(editTitleModal.value)
  }
})
</script>