<template>
  <form @submit.prevent="saveItem">
    <div class="mb-3">
      <label for="addItemType" class="form-label">Tipo de ítem</label>
      <select class="form-select" id="addItemType" v-model="formItemStore.form.type" required>
        <option value="task">Tarea</option>
        <option value="milestone">Hito</option>
        <option value="process">Proceso</option>
      </select>
    </div>

    <div class="mb-3">
      <label for="addItemName" class="form-label">Nombre</label>
      <input type="text" class="form-control" id="addItemName" v-model="formItemStore.form.name" required />
    </div>

    <div class="mb-3">
      <label for="addItemDetail" class="form-label">Detalle</label>
      <textarea class="form-control" id="addItemDetail" rows="2" v-model="formItemStore.form.detail"></textarea>
    </div>

    <!-- Campos específicos para Process -->
    <div v-if="formItemStore.form.type === 'process'">
      <div class="mb-3">
        <div class="form-check">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="addItemUseManualCost" 
            v-model="formItemStore.form.useManualCost"
          >
          <label class="form-check-label" for="addItemUseManualCost">
            Usar costo manual (en lugar del calculado automáticamente)
          </label>
        </div>
        <div class="form-text">Si no está marcado, el costo se calculará sumando los costos de los ítems hijos.</div>
      </div>
      
      <div v-if="formItemStore.form.useManualCost" class="mb-3">
        <label for="addItemCost" class="form-label">Costo manual</label>
        <input type="number" class="form-control" id="addItemCost" v-model.number="formItemStore.form.cost" min="0" step="0.01" />
      </div>
      
      <div v-else class="mb-3">
        <div class="alert alert-info">
          <small>El costo se calculará automáticamente sumando los costos de los ítems hijos.</small>
        </div>
      </div>
    </div>

    <!-- Campo Cost para Task y Milestone -->
    <div v-if="formItemStore.form.type !== 'process'" class="mb-3">
      <label for="addItemCost" class="form-label">Costo (opcional)</label>
      <input type="number" class="form-control" id="addItemCost" v-model.number="formItemStore.form.cost" min="0" step="0.01" />
    </div>

    <div id="addItemSpecificFields">
      <div v-if="formItemStore.form.type === 'task'">
        <div class="mb-3">
          <label for="addItemDuration" class="form-label">Duración (días)</label>
          <input type="number" class="form-control" id="addItemDuration" v-model.number="formItemStore.form.duration" required />
        </div>
        <div class="mb-3">
          <label for="addActualStartDate" class="form-label">Inicio real (opcional)</label>
          <input type="date" class="form-control" id="addActualStartDate" v-model="formItemStore.form.actualStartDate" />
        </div>
      </div>

      <div v-if="formItemStore.form.type === 'milestone'">
        <div class="mb-3">
          <label for="addActualStartDate" class="form-label">Inicio real (opcional)</label>
          <input type="date" class="form-control" id="addActualStartDate" v-model="formItemStore.form.actualStartDate" />
        </div>
      </div>
    </div>

    <div class="mb-3">
      <label for="addItemPredecessors" class="form-label">Predecesores</label>
      <select multiple class="form-select" id="addItemPredecessors" v-model="formItemStore.form.predecessorIds">
        <option v-for="option in projectStore.controller.getAllItems()" :key="option.id" :value="option.id">
          {{ option.name }} (#{{ option.id }})
        </option>
      </select>
      <div class="form-text">Puedes mantener Ctrl (o Cmd) presionado para seleccionar varios.</div>
    </div>

    <div class="mb-3">
      <label for="addItemParentProcess" class="form-label">Pertenece a proceso</label>
      <select class="form-select" id="addItemParentProcess" v-model="formItemStore.form.processId">
        <option v-for="option in projectStore.controller.getAllProcess()" :key="option.id" :value="option.id">
          {{ option.name }}
        </option>
      </select>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project';
import { useFormItemStore } from '../../stores/formItem';

const projectStore = useProjectStore();
const formItemStore = useFormItemStore();

// La lógica para guardar el item ahora reside en el store
const saveItem = () => {
  try {
    formItemStore.submitForm();
  } catch (error) {
    console.error('Error saving item:', error);
    // Aquí podrías mostrar un mensaje de error al usuario
  }
};
</script>