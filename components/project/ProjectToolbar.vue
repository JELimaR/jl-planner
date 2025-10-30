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
        💾 Guardar Proyecto
      </button>

      <!-- Cambiar fecha de inicio -->
      <div class="d-flex align-items-center mx-5">
        <DateInput
          v-model="selectedDate"
        />

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
        📄 Generar PDF
      </button>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TDateString } from '../../src/models/dateFunc';
import { useProjectStore } from '../../stores/project'
import { useToast } from '../../composables/useToast'
import DateInput from '../DateInput.vue'

const selectedDate = ref<TDateString | undefined>(undefined);

const projectStore = useProjectStore()
const { showWarning } = useToast()

const changeStartDate = async () => {
  if (selectedDate.value) {
    await projectStore.changeStartDate(selectedDate.value)
    // Limpiar el input después de cambiar la fecha
    selectedDate.value = undefined
  } else {
    // Mostrar toast de advertencia cuando no hay fecha seleccionada
    showWarning('Fecha Requerida', 'Por favor selecciona una fecha antes de cambiar el inicio del proyecto')
  }
}

</script>