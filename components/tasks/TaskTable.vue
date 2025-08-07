<template>
  <div class="container">
    <h2 class="mb-3">Tabla de Tareas</h2>
    <div class="custom_table_wrapper table-responsive">
      <table class="custom_table">
        <thead>
          <tr>
            <th style="width: 5%">ID</th>
            <th style="width: 19%">Nombre</th>
            <th style="width: 19%">Detalle</th>
            <th style="width: 7%">Duración</th>
            <th style="width: 15%">Inicio</th>
            <th style="width: 15%">Fin</th>
            <th style="width: 10%">Dependencias</th>
            <th style="width: 10%">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="item.id" 
              :style="getRowStyle(item, index)">
            <td :style="`padding-left: ${5 + 0 * getDepth(item) * 8}px; font-size: 8px;`">{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.detail || '' }}</td>
            <td>{{ item instanceof Task ? item.duration : '-' }}</td>
            <td>{{ formatDateToDisplay(item.getStartDate()!) }}</td>
            <td>{{ formatDateToDisplay(item.getEndDate()!) }}</td>
            <td>{{ getPredecessors(item) }}</td>
            <td class="action-buttons">
              <div
              v-if="!projectStore.controller.isStart(item) && !projectStore.controller.isEnd(item)"
              >
              <button
                class="btn btn-sm btn-light"
                @click="changeOrder(item, 'up')"
                :disabled="!canMoveUp(item, index)"
              >
                ⬆️
              </button>
              <button
                class="btn btn-sm btn-light"
                @click="changeOrder(item, 'down')"
                :disabled="!canMoveDown(item, index)"
              >
                ⬇️
              </button>
              <button
                class="btn btn-sm btn-primary"
                @click="editItem(item)"
              >✏️</button>
              <button
                class="btn btn-sm btn-danger"
                @click="deleteItem(item)"
              >🗑️</button>
            </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Botón Agregar -->
    <div class="my-3">
      <button class="btn btn-success" @click="addITem()">
        ➕ Agregar Item
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useProjectStore } from '../../stores/project'
import { useUIStore } from '../../stores/ui'
import { useFormItemStore } from '../../stores/formItem'
import { Task } from '../../src/models/Task'
import { processColorMap } from '../../src/views/colors'
import type { Item } from '../../src/models/Item'
import { formatDateToDisplay } from '../../src/models/dateFunc'
import { Milestone } from '../../src/models/Milestone'
import { Process } from '../../src/models/Process'

const projectStore = useProjectStore()
const uiStore = useUIStore()

// Obtener los items del proyecto
const items = computed(() => {
  const allItems: Item[] = []
  projectStore.controller.getAllItems().forEach((item: Item) => {
    if (item !== projectStore.controller.getProject().getRoot()) {
      allItems.push(item)
    }
  })
  return allItems
})

// Obtener el nivel de profundidad del item
const getDepth = (item: Item): number => {
  let depth = 0
  let current = item
  while (current.parent && current.parent.id !== 0) {
    depth++
    current = current.parent
  }
  return depth
}

// Obtener el estilo de la fila
const getRowStyle = (item: Item, depth: number) => {
  const borderWidth = `${Math.max(0.5, 4 / 2 ** depth)}px`
  const opacity = 1 - depth * 0.05
  const bgColor = processColorMap.get(item.id) || '#ffffff'
  
  return {
    fontSize: '12px',
    borderBottom: `${borderWidth} solid rgba(0,0,0,${opacity}) !important`,
    backgroundColor: `${bgColor} !important`
  }
}

// Obtener los predecesores del item
const getPredecessors = (item: Item): string => {
  const project = projectStore.controller.getProject()
  let predecessors = Array.from(item.predecessors)
    .map((i) => i.id)
    .filter((i) => i !== project.getStartMilestone().id)
    .join(', ')
  return item.id === project.getEndMilestone().id ? '' : predecessors
}

// Agregar un Item
const addITem = () => {
  projectStore.setupItemForEdit(null)
  useFormItemStore().resetForm()
  uiStore.openAddModal()
}

// Editar un item
const editItem = (item: Item) => {
  projectStore.setupItemForEdit(item.id)
  uiStore.openAddModal()
}

// Eliminar un item
const deleteItem = (item: Item) => {
  projectStore.itemToDelete = item.id
  uiStore.openDeleteModal()
}

// Función para cambiar el orden
const changeOrder = (item: Item, sense: 'up' | 'down') => {
  projectStore.changeOrder(item, sense)
}

// Función para deshabilitar el botón de subir
const canMoveUp = (item: Item, index: number): boolean => {
  if (
    item instanceof Milestone &&
    (item.id === projectStore.controller.getProject().getStartMilestone().id ||
      item.id === projectStore.controller.getProject().getEndMilestone().id)
  ) {
    return false
  }
  const parent = item.parent as Process | undefined;
  if (!parent) return false
  const children = parent.children
  if (children.indexOf(item) === 0) return false
  const prevSibling = children[children.indexOf(item) - 1]
  if (prevSibling && prevSibling.id === projectStore.controller.getProject().getStartMilestone().id) {
    return false
  }
  return true
}

// Función para deshabilitar el botón de bajar
const canMoveDown = (item: Item, index: number): boolean => {
  if (
    item instanceof Milestone &&
    (item.id === projectStore.controller.getProject().getStartMilestone().id ||
      item.id === projectStore.controller.getProject().getEndMilestone().id)
  ) {
    return false
  }
  const parent = item.parent as Process | undefined;
  if (!parent) return false
  const children = parent.children
  if (children.indexOf(item) === children.length - 1) return false
  const nextSibling = children[children.indexOf(item) + 1]
  if (nextSibling && nextSibling.id === projectStore.controller.getProject().getEndMilestone().id) {
    return false
  }
  return true
}


// Actualizar la tabla cuando cambie el proyecto
watch(() => projectStore.projectStartDate, () => {
  projectStore.controller.getProject().calculateItemDates()
})
</script>

<style>
/* Estilo para los botones en la tabla */
.custom_table .action-buttons button {
  width: 18px;
  height: 18px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px; /* Reduce el tamaño de la fuente para los iconos/emojis */
  line-height: 1; /* Asegura que el contenido esté bien centrado */
  margin: 0 2px; /* Espacio entre los botones */
}

/* Estilo para el contenedor de los botones */
.custom_table .action-buttons {
  white-space: nowrap; /* Evita que los botones se envuelvan en varias líneas */
}

/* Estilo para reducir el espacio de las celdas de la tabla */
.custom_table td {
  padding: 6px 8px;
}
</style>