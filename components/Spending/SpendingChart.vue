<template>
    <div>
        <h5 class="card-title mb-3">Gasto en función del tiempo</h5>
        <div v-if="chartData.datasets[0].data.length" style="height: 400px;">
            <LineChart :chart-data="chartData" :chart-options="chartOptions" />
        </div>
        <div v-else class="alert alert-info text-center" role="alert">
            No hay datos de gasto para mostrar.
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { SpendingMethod } from '../../src/controllers/ProjectController';
import { useProjectStore } from '../../stores/project';

const props = defineProps<{
    spendingMethod: SpendingMethod
}>()

const projectStore = useProjectStore()
const dailySpendingData = ref<Array<{ d: string, v: number }>>([])

watch([() => props.spendingMethod, () => projectStore.projectData], async (newValues) => {
    if (newValues[1]) {
        dailySpendingData.value = await projectStore.getDailySpending(props.spendingMethod) || []
    }
}, { immediate: true })

const cumulativeSpendingData = computed(() => {
    let cumulative = 0
    return dailySpendingData.value.map(day => {
        cumulative += day.v
        return cumulative
    })
})

const chartData = computed(() => {
    return {
        labels: dailySpendingData.value.map(d => d.d),
        datasets: [{
            label: 'Gasto Acumulado',
            data: cumulativeSpendingData.value, // Usar el gasto acumulado
            fill: true,
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13, 110, 253, 0.2)',
            tension: 0.2
        }]
    }
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        x: {
            title: { display: true, text: 'Fecha' },
            type: 'category'
        },
        y: {
            title: { display: true, text: 'Gasto Acumulado ($)' },
            beginAtZero: true
        }
    }
}
</script>