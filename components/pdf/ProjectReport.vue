<template>
  <div>
    <!-- Este componente no renderiza nada visible, solo genera PDFs -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useProjectStore, flattenItemsList } from '../../stores/project'
import { generateProjectReport } from './pdfGenerator'

const projectStore = useProjectStore()

/**
 * Función para generar y descargar el PDF
 */
const download = async () => {
  try {
    console.log('Iniciando generación de PDF...')

    if (import.meta.client) {
      // Validar que hay items para generar el reporte
      if (!projectStore.projectItems || projectStore.projectItems.length === 0) {
        console.warn('No hay items para generar el reporte')
        return
      }

      // Obtener datos del proyecto
      const projectData = projectStore.projectData
      if (!projectData) {
        console.warn('No hay datos del proyecto')
        return
      }

      // Generar el reporte usando la función centralizada
      await generateProjectReport(
        projectData,
        projectData.startDate,
        projectData.endDate,
        projectStore.currentScale || 'week'
      )
    }
  } catch (error) {
    console.error('Error al generar PDF:', error)
  }
}

// Escuchar el evento del store
onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('generate-pdf', download)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('generate-pdf', download)
  }
})

// Exponer la función de descarga
defineExpose({
  download
})
</script>
