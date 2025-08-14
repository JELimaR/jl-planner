<template>
<div>
<h5 class="card-title mb-3">Resumen de Gasto</h5>
<div class="mb-3">
<label for="groupingPeriod" class="form-label visually-hidden">Período de Agrupación</label>
<select id="groupingPeriod" v-model="groupingPeriod" class="form-select w-auto">
<option value="month">Por Mes</option>
<option value="year">Por Año</option>
</select>
</div>

<table v-if="summarizedSpending.length" class="table table-bordered table-striped">
<thead>
<tr>
<th scope="col">Período</th>
<th scope="col">Gasto Total ($)</th>
</tr>
</thead>
<tbody>
<tr v-for="item in summarizedSpending" :key="item.period">
<td>{{ item.period }}</td>
<td>{{ item.total }}</td>
</tr>
</tbody>
</table>
<div v-else class="alert alert-info text-center" role="alert">
No hay datos de gasto para mostrar.
</div>
</div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { SpendingMethod } from '../../src/controllers/ProjectController';
import { useProjectStore } from '../../stores/project';
import { TDateString, displayStringToDate } from '../../src/models/dateFunc';

const props = defineProps<{
spendingMethod: SpendingMethod
}>()

const projectStore = useProjectStore()
const groupingPeriod = ref<'month' | 'year'>('month')
const dailySpendingData = ref<Array<{ d: string, v: number }>>([])

watch([() => props.spendingMethod, () => projectStore.projectData], async (newValues) => {
if (newValues[1]) {
dailySpendingData.value = await projectStore.getDailySpending(props.spendingMethod) || []
}
}, { immediate: true })

const summarizedSpending = computed(() => {
const summary = new Map<string, number>()

dailySpendingData.value.forEach(({ d, v }) => {
const date = displayStringToDate(d as TDateString)
let key = ''

if (groupingPeriod.value === 'year') {
key = date.getFullYear().toString()
} else {
const year = date.getFullYear()
const month = date.getMonth() + 1
key = `${year}-${month.toString().padStart(2, '0')}`
}
summary.set(key, (summary.get(key) || 0) + v)
})

return Array.from(summary.entries()).map(([period, total]) => ({
period,
total: total.toFixed(2)
}))
})
</script>