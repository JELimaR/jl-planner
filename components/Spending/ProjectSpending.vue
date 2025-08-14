<template>
  <div class="container my-5">
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card p-3">
          <div class="d-flex align-items-center mb-3">
            <h3 class="card-title mb-0">Análisis de Gasto</h3>
            <select v-model="spendingMethod" class="form-select w-auto ms-auto">
              <option value="linear">Lineal</option>
              <option value="started">Al inicio</option>
              <option value="finished">Al final</option>
            </select>
          </div>
          <p class="text-muted small">
            Selecciona el método para distribuir el costo de las tareas.
          </p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <SpendingChart :spending-method="spendingMethod" />
          </div>
        </div>
      </div>
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <SpendingSummaryTable :spending-method="spendingMethod" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SpendingMethod } from '../../src/controllers/ProjectController';

const spendingMethod = ref<SpendingMethod>('linear')
</script>