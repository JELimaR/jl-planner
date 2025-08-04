<template>
  <div class="container my-4">
    <h3>Caminos Críticos Detectados</h3>
    
    <div v-if="criticalPaths.length === 0">
      <p>No se detectaron caminos críticos.</p>
    </div>
    
    <div v-for="(cp, index) in criticalPaths" :key="index">
      <h5 class="mt-4">Camino Crítico #{{ index + 1 }} — Retraso total: {{ cp.totalDelayDays }} días</h5>
      
      <table class="table table-sm table-bordered">
        <thead>
          <tr>
            <th style="width: 4%">#</th>
            <th style="width: 8%; font-size: 0.75rem;">ID</th>
            <th style="width: 38%">Nombre</th>
            <th style="width: 20%">Tipo</th>
            <th style="width: 20%">Retraso (días)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in cp.path" :key="item.id">
            <td>{{ i + 1 }}</td>
            <td style="font-size: 0.75rem;">{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td style="font-size: 0.75rem;">{{ formatDate(item.getStartDate()) }}</td>
            <td>{{ item.getDelayInDays() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useProjectStore } from '../../stores/project'

const projectStore = useProjectStore()
const criticalPaths = computed(() => projectStore.controller.getProject().getCriticalPaths())

// Formatear fecha
const formatDate = (date?: Date): string => {
  if (!date) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript van de 0 a 11
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

// Actualizar los caminos críticos cuando cambien las fechas del proyecto
watch(
  () => [projectStore.projectStartDate, projectStore.projectEndDate],
  () => {
    // La reactividad de Vue actualizará automáticamente la vista
    // cuando cambie criticalPaths
  }
)
</script>
