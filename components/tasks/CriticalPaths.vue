<template>
  <div class="container my-4">
    <h3>Caminos Críticos Detectados</h3>
    
    <div v-if="criticalPaths.length === 0">
      <p>No se detectaron caminos críticos.</p>
    </div>
    
    <div v-for="(cp, cpidx) in criticalPaths" :key="cpidx">
      <h5 class="mt-4">Camino Crítico #{{ cpidx + 1 }} — Retraso total: {{ cp.totalDelayDays }} días</h5>
      
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
            <td style="font-size: 0.75rem;">{{ item.startDate }}</td>
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
import { formatDateToDisplay } from '../../src/models/dateFunc';

const projectStore = useProjectStore()
const criticalPaths = projectStore.criticalPaths || []; // no debería ser así

// Actualizar los caminos críticos cuando cambien las fechas del proyecto
watch(
  () => [projectStore.projectStartDate, projectStore.projectEndDate],
  () => {
    // La reactividad de Vue actualizará automáticamente la vista
    // cuando cambie criticalPaths
  }
)
</script>
