<template>
  <div>
    <h2>Análisis de Gasto del Proyecto</h2>
    
    <div class="mb-3">
      <label for="spendingMethodSelect" class="form-label">Método de Gasto</label>
      <select class="form-select" id="spendingMethodSelect" v-model="selectedMethod">
        <option value="finished">Gasto por ítem terminado</option>
        <option value="started">Gasto por ítem empezado</option>
        <option value="linear">Gasto distribuido linealmente</option>
      </select>
    </div>

    <div class="card my-4">
      <div class="card-header">Gráfica Gasto vs. Tiempo (Acumulado)</div>
      <div class="card-body">
        <canvas ref="spendingChart"></canvas>
      </div>
    </div>

    <div class="card">
      <div class="card-header">Tabla Gasto por Periodo</div>
      <div class="card-body table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Gasto Diario</th>
              <th>Gasto Acumulado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, date) in dailySpending" :key="date">
              <td>{{ date }}</td>
              <td>${{ value.toFixed(2) }}</td>
              <td>${{ getCumulativeSpending(date).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useProjectStore } from '../../stores/project';
import Chart from 'chart.js/auto';

const projectStore = useProjectStore();
const selectedMethod = ref('linear'); // Método por defecto
const spendingChart = ref(null);
let chartInstance = null;

// Llama al controlador para obtener el gasto diario
const dailySpending = computed(() => {
  return projectStore.controller.calculateDailySpending(selectedMethod.value);
});

// Calcula el gasto acumulado
const cumulativeSpending = computed(() => {
  const dates = Array.from(dailySpending.value.keys()).sort();
  const spendingData = Array.from(dailySpending.value.values());
  
  let cumulative = 0;
  const cumulativeMap = new Map<string, number>();

  for (let i = 0; i < dates.length; i++) {
    cumulative += spendingData[i];
    cumulativeMap.set(dates[i], cumulative);
  }
  return cumulativeMap;
});

const getCumulativeSpending = (date: string) => {
  return cumulativeSpending.value.get(date) || 0;
};

// Lógica para renderizar la gráfica
const renderChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const dates = Array.from(dailySpending.value.keys()).sort();
  const data = dates.map(date => cumulativeSpending.value.get(date) || 0);

  const ctx = spendingChart.value.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Gasto Acumulado ($)',
        data: data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Fecha'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Gasto Acumulado ($)'
          }
        }
      }
    }
  });
};

// Observa cambios en el método o en el proyecto para actualizar la gráfica
watch([selectedMethod, () => projectStore.projectStartDate], () => {
  renderChart();
}, { immediate: true });

onMounted(() => {
  renderChart();
});
</script>