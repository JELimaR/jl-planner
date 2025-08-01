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
      <select multiple class="form-select" id="addItemPredecessors" v-model="formItemStore.form.predecessors">
        <option v-for="option in projectStore.controller.getProject().getAllItems().values()" :key="option.id" :value="option.id">
          {{ option.name }} (#{{ option.id }})
        </option>
      </select>
      <div class="form-text">Puedes mantener Ctrl (o Cmd) presionado para seleccionar varios.</div>
    </div>

    <div class="mb-3">
      <label for="addItemParentProcess" class="form-label">Pertenece a proceso</label>
      <select class="form-select" id="addItemParentProcess" v-model="formItemStore.form.parentProcessId">
        <option v-for="option in projectStore.controller.getAllProcess()" :key="option.id" :value="option.id">
          {{ option.name }}
        </option>
      </select>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useProjectStore } from '../stores/project';
import { useFormItemStore } from '../stores/formItem';

const projectStore = useProjectStore();
const formItemStore = useFormItemStore();

// La lógica para guardar el item ahora reside en el store
const saveItem = () => {
  formItemStore.submitForm();
  
};
</script>