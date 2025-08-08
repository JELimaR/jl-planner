<template>
  <div class="container my-3">
    <div class="d-flex flex-wrap align-items-center gap-2">
      <!-- Proyecto -->
      <button 
        class="btn btn-outline-danger btn-sm" 
        @click="projectStore.newProject()"
      >
        🆕 Nuevo proyecto
      </button>
      <button
        class="btn btn-outline-danger btn-sm"
        @click="projectStore.resetActualStartDates()"
      >
        🔄 Reset fechas manuales
      </button>

      <!-- Cargar / Guardar -->
      <ProjectLoader />

      <button
        class="btn btn-outline-secondary btn-sm"
        @click="projectStore.saveProject()"
      >
        💾 Guardar
      </button>

      <!-- Cambiar fecha de inicio -->
      <div class="d-flex align-items-center mx-5">
        <DateInput
          v-model="selectedDate"
        />
        <!-- <input
          type="date"
          class="form-control form-control-sm ms-2"
          v-model="projectStore.projectStartDate"
        /> -->
        <button
          class="btn btn-outline-primary btn-sm ms-2"
          @click="changeStartDate"

        >
          Cambiar inicio
        </button>
      </div>

      <!-- exportar -->
      <button 
        class="btn btn-outline-primary btn-sm" 
        @click="projectStore.exportPDF()"
      >
        🖨️ Imprimir Informe
      </button>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project'
import DateInput from '../DateInput.vue'

const selectedDate = ref<TDateString | undefined>(undefined);

const projectStore = useProjectStore()
const changeStartDate = () => {
  projectStore.changeStartDate(selectedDate.value)
}

</script>