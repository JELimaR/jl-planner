<template>
  <form @submit.prevent="saveItem">
    <div class="mb-3">
      <label for="addItemType" class="form-label">Tipo de ítem</label>
      <select class="form-select" id="addItemType" v-model="formItemStore.form.type" required
        :disabled="formItemStore.form.id !== -1">
        <option value="task">Tarea</option>
        <option value="milestone">Hito</option>
        <option value="process">Proceso</option>
      </select>
    </div>

    <div class="mb-3">
      <label for="addItemName" class="form-label">Nombre</label>
      <input type="text" class="form-control" id="addItemName" v-model="formItemStore.form.name" required />
      <div v-if="!formItemStore.form.name.trim()" class="text-danger mt-1">
        El nombre es un campo obligatorio.
      </div>
    </div>

    <div class="mb-3">
      <label for="addItemDetail" class="form-label">Detalle</label>
      <textarea class="form-control" id="addItemDetail" rows="3" v-model="formItemStore.form.detail"></textarea>
    </div>

    <div v-if="formItemStore.form.type === 'process'">
      <div class="mb-3">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="addItemUseManualCost"
            v-model="formItemStore.form.useManualCost">
          <label class="form-check-label" for="addItemUseManualCost">
            Usar costo manual (en lugar del calculado automáticamente)
          </label>
        </div>
        <div class="form-text">Si no está marcado, el costo se calculará sumando los costos de los ítems hijos.</div>
      </div>

      <div v-if="formItemStore.form.useManualCost" class="mb-3">
        <label for="addItemCost" class="form-label">Costo manual</label>
        <input type="number" class="form-control" id="addItemCost" v-model.number="formItemStore.form.cost" min="0"
          step="0.01" />
        <div v-if="formItemStore.form.cost === null || formItemStore.form.cost! < 0" class="text-danger mt-1">
          El costo manual debe ser un número positivo.
        </div>
      </div>

      <div v-else class="mb-3">
        <div class="alert alert-info">
          <small>El costo se calculará automáticamente sumando los costos de los ítems hijos.</small>
        </div>
      </div>
    </div>

    <div v-if="formItemStore.form.type !== 'process'" class="mb-3">
      <label for="addItemCost" class="form-label">Costo (opcional)</label>
      <input type="number" class="form-control" id="addItemCost" v-model.number="formItemStore.form.cost" min="0"
        step="0.01" />
    </div>

    <div id="addItemSpecificFields">
      <div v-if="formItemStore.form.type === 'task'">
        <div class="mb-3">
          <label for="addItemDuration" class="form-label">Duración (días)</label>
          <input type="number" class="form-control" id="addItemDuration" v-model.number="formItemStore.form.duration"
            required />
          <div v-if="formItemStore.form.duration === null || formItemStore.form.duration! <= 0"
            class="text-danger mt-1">
            La duración debe ser un número positivo.
          </div>
        </div>
        <div class="mb-3">
          <label for="addActualStartDate" class="form-label">Inicio real (opcional)</label>
          <DateInput id="addActualStartDate" v-model="formItemStore.form.actualStartDate" />
        </div>
      </div>

      <div v-if="formItemStore.form.type === 'milestone'">
        <div class="mb-3">
          <label for="addActualStartDate" class="form-label">Inicio real (opcional)</label>
          <DateInput id="addActualStartDate" v-model="formItemStore.form.actualStartDate" />
        </div>
      </div>
    </div>

    <div class="mb-3">
      <label for="addItemPredecessors" class="form-label">Predecesores</label>
      <select multiple class="form-select" id="addItemPredecessors" v-model="formItemStore.form.predecessorIds">
        <option v-for="option in getPredecessorOptions()" :key="option.id" :value="option.id">
          {{ option.name }} (#{{ option.id }})
        </option>
      </select>
      <div class="form-text">Puedes mantener Ctrl (o Cmd) presionado para seleccionar varios.</div>
    </div>

    <div class="mb-3">
      <label for="addItemParentProcess" class="form-label">Pertenece a proceso</label>
      <select class="form-select" id="addItemParentProcess" v-model="formItemStore.form.parentId"
        :disabled="formItemStore.form.id !== -1">
        <option v-for="option in getAllProcess()" :key="option.id" :value="option.id">
          {{ option.name }}
        </option>
      </select>
    </div>

    <div class="mt-3 d-flex justify-content-end">
      <button type="button" class="btn btn-secondary me-2" @click="close()">Cancelar</button>
      <button type="submit" class="btn btn-primary" :disabled="!formItemStore.isFormValid">Guardar</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project';
import { useFormItemStore } from '../../stores/formItem';
import { useUIStore } from '../../stores/ui';
import { flattenItemsList } from '../../stores/project';
import type { IItemData } from '../../src/models/Item'

const projectStore = useProjectStore();
const formItemStore = useFormItemStore();
const uiStore = useUIStore();

// Obtiene todos los procesos, incluyendo el proceso raíz
const getAllProcess = () => {
  const processes = flattenItemsList(projectStore.projectItems)
    .filter(item => item.type === 'process');

  // Agregar el proceso raíz manualmente, ya que no es un ítem 'normal'
  processes.unshift({
    id: 1001,
    name: 'Proyecto Raíz',
  } as IItemData);

  return processes;
};

// Obtiene la lista de opciones para los predecesores, excluyendo start (1000) y end (1002)
const getPredecessorOptions = () => {
  return flattenItemsList(projectStore.projectItems).filter(item => item.id !== 1000 && item.id !== 1002);
}

const close = () => {
  uiStore.closeAddModal();
  formItemStore.resetForm();
};

const saveItem = () => {
  if (formItemStore.isFormValid) {
    formItemStore.submitForm()
    close();
  }
};
</script>