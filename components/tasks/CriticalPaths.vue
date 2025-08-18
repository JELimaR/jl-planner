<template>
  <div class="container my-4">
    <h3>Caminos Críticos Detectados</h3>
    
    <div class="mb-3">
      <button 
        class="btn btn-sm"
        :class="{ 'btn-primary': uiStore.criticalPathIndex !== null, 'btn-secondary': uiStore.criticalPathIndex === null }"
        @click="toggleShowAll"
      >
        {{ uiStore.criticalPathIndex !== undefined ? 'Ocultar Caminos Críticos' : 'Mostrar Caminos Críticos' }}
      </button>
    </div>
    
    <div v-if="criticalPaths.length === 0">
      <p>No se detectaron caminos críticos.</p>
    </div>
    
    <div v-else>
      <div v-for="(cp, cpidx) in criticalPaths" :key="cpidx">
        <h5 class="mt-4">Camino Crítico #{{ cpidx + 1 }} — Retraso total: {{ cp.totalDelayDays }} días</h5>
        <button
          class="btn btn-sm"
          :class="{
            'btn-primary': uiStore.criticalPathIndex === cpidx,
            'btn-outline-primary': uiStore.criticalPathIndex !== cpidx
          }"
          @click="toggleCriticalPathIndex(cpidx)"
        >
          {{ uiStore.criticalPathIndex === cpidx ? 'Seleccionado' : 'Seleccionar como Camino Crítico' }}
        </button>
        
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
              <td>{{ getDelayInDays(item) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '../../stores/project'
import { useUIStore } from '../../stores/ui';
import { getDelayInDays } from '../gantt/ganttHelpers';

const projectStore = useProjectStore()
const uiStore = useUIStore()

const criticalPaths = computed(() => projectStore.criticalPaths || []);

// ✅ Nueva función para el toggle global
const toggleShowAll = () => {
  if (uiStore.criticalPathIndex === undefined) {
    uiStore.setCriticalPathIndex(-1); // Muestra todos
  } else {
    uiStore.removeCriticalPathIndex(); // Oculta todos
  }
};

// ✅ Nueva función para el toggle de un camino específico
const toggleCriticalPathIndex = (index: number) => {
  if (uiStore.criticalPathIndex === index) {
    uiStore.removeCriticalPathIndex(); // Deselecciona si ya está seleccionado
  } else {
    uiStore.setCriticalPathIndex(index); // Selecciona el nuevo
  }
};
</script>