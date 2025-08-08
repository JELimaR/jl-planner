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
          <tr v-for="(item, index) in flattenedItems" :key="item.id" 
              :style="getRowStyle(item, getDepth(item))">
            <td :style="`padding-left: ${5 + 0 * getDepth(item) * 8}px; font-size: 8px;`">{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.detail || '' }}</td>
            <td>{{ item.type === 'task' ? (item as ITaskData).duration : '-' }}</td>
            <td>{{ item.startDate }}</td>
            <td>{{ item.endDate }}</td>
            <td>{{ item.predecessorIds.filter(pi => pi !== 1000).join(', ') }}</td>

            <td class="action-buttons">
              <div
              v-if="(item.id !== 1000) && (item.id !== 1002)"
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
import { ITaskData, Task } from '../../src/models/Task'
import { processColorMap } from '../../src/views/colors'
import type { IItemData } from '../../src/models/Item'
import { IProcessData } from '../../src/models/Process'
import { flattenItemsList } from '../../stores/project'

const projectStore = useProjectStore()
const uiStore = useUIStore()


const flattenedItems = computed(() => flattenItemsList(projectStore.projectItems))
// Obtener el padre de un item de forma segura
const getParent = (item: IItemData): IItemData | undefined => {
  if (!item.parentId) {
    return undefined;
  }
  return flattenedItems.value.find(fi => fi.id === item.parentId);
}

// Obtener el nivel de profundidad del item
const getDepth = (item: IItemData): number => {
  let depth = 0;
  let current: IItemData | undefined = item;
  while (current && current.parentId !== undefined && current.parentId !== 1001) {
    current = flattenedItems.value.find(fi => fi.id === current?.parentId);
    if (current) {
      depth++;
    } else {
      break;
    }
  }
  return depth;
}

// Obtener el estilo de la fila
const getRowStyle = (item: IItemData, depth: number) => {
  const borderWidth = `${Math.max(0.5, 4 / 2 ** depth)}px`
  const opacity = 1 - depth * 0.05
  // const bgColor = processColorMap.get(item.id) || '#ffffff';
  const bgColor = item.color;
  return {
    fontSize: '12px',
    borderBottom: `${borderWidth} solid rgba(0,0,0,${opacity}) !important`,
    backgroundColor: `${bgColor} !important`
  }
}

// Agregar un Item
const addITem = () => {
  projectStore.setupItemForEdit(null)
  useFormItemStore().resetForm()
  uiStore.openAddModal()
}

// Editar un item
const editItem = (item: IItemData) => {
  projectStore.setupItemForEdit(item)
  uiStore.openAddModal()
}

// Eliminar un item
const deleteItem = (item: IItemData) => {
  projectStore.itemToDelete = item
  uiStore.openDeleteModal()
}

// Función para cambiar el orden
const changeOrder = (item: IItemData, sense: 'up' | 'down') => {
  projectStore.changeOrder(item.id, sense)
}

// Función para deshabilitar el botón de subir
const canMoveUp = (item: IItemData, index: number): boolean => {
  const parent = getParent(item);
  hay que corregir esta funcion
  if (!parent) return false
  const children = (parent as IProcessData).children
  if (children.indexOf(item) === 0) return false
  const prevSibling = children[children.indexOf(item) - 1]
  if (prevSibling && prevSibling.id === 1000) { // mejorar
    return false
  }
  return true
}

// Función para deshabilitar el botón de bajar
const canMoveDown = (item: IItemData, index: number): boolean => {
  const parent = getParent(item);
  hay que corregir esta funcion
  if (!parent) return false
  const children = (parent as IProcessData).children
  if (children.indexOf(item) === children.length - 1) return false
  const nextSibling = children[children.indexOf(item) + 1]
  if (nextSibling && nextSibling.id === 1002) { // mejorar
    return false
  }
  return true
}

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