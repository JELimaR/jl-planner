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
            <th style="width: 10%"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="item.id" 
              :style="getRowStyle(item, index)">
            <td :style="`padding-left: ${5 + 0 * getDepth(item) * 16}px; font-size: 8px;`">{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.detail || '' }}</td>
            <td>{{ item instanceof Task ? item.duration : '-' }}</td>
            <td>{{ formatDate(item.getStartDate()) }}</td>
            <td>{{ formatDate(item.getEndDate()) }}</td>
            <td>{{ getPredecessors(item) }}</td>
            <td class="action-buttons">
              <button
                class="btn btn-sm btn-primary"
                @click="editItem(item)"
                v-if="item !== projectStore.controller.getProject().getStartMilestone() || item !== projectStore.controller.getProject().getEndMilestone()"
              >✏️</button>
              <button
                class="btn btn-sm btn-danger"
                @click="deleteItem(item)"
              >🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Botón Agregar -->
    <div class="my-3">
      <button class="btn btn-success" @click="uiStore.openAddModal()">
        ➕ Agregar Item
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useProjectStore } from '../stores/project'
import { useUIStore } from '../stores/ui'
import { Task } from '../src/models/Task'
import { processColorMap } from '../src/views/colors'
import type { Item } from '../src/models/Item'

const projectStore = useProjectStore()
const uiStore = useUIStore()

// Obtener los items del proyecto
const items = computed(() => {
  const allItems: Item[] = []
  projectStore.controller.getProject().traverse((item) => {
    allItems.push(item)
  })
  return allItems
})

// Formatear fecha
const formatDate = (date?: Date): string => {
  return date ? date.toISOString().split('T')[0] : ''
}

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

// Actualizar la tabla cuando cambie el proyecto
watch(() => projectStore.projectStartDate, () => {
  projectStore.controller.getProject().calculateItemDates()
})
</script>

