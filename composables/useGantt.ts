import { ref, computed } from 'vue'
import { useProjectStore } from '../stores/project'
import { getCalendarLimitDates } from '../src/views/ganttCalendar'
import type { Scale } from '../src/views/ganttHelpers'

export function useGantt() {
  const projectStore = useProjectStore()
  const scale = computed(() => projectStore.currentScale)
  
  const calendarDates = computed(() => {
    return getCalendarLimitDates(
      projectStore.projectStartDate,
      projectStore.projectEndDate,
      scale.value
    )
  })
  
  const calendarStartDate = computed(() => calendarDates.value.calendarStartDate)
  const calendarEndDate = computed(() => calendarDates.value.calendarEndDate)
  
  // Obtener todos los items del proyecto
  const projectItems = computed(() => {
    const items: any[] = []
    projectStore.controller.getProject().traverse((item) => {
      items.push({
        id: item.id,
        name: item.name,
        type: item.constructor.name.toLowerCase(),
        startDate: item.getStartDate(),
        endDate: item.getEndDate(),
        processId: item.parent?.id ?? null,
        isCritical: item.isCritical,
        predecessors: item.predecessors
      })
    })
    return items
  })
  
  // Cambiar la escala del Gantt
  function changeScale(newScale: Scale) {
    projectStore.currentScale = newScale
  }
  
  return {
    scale,
    calendarStartDate,
    calendarEndDate,
    projectItems,
    changeScale
  }
}