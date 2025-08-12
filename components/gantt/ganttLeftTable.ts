import { flattenItemsListWithDepth } from '../../stores/project';
import { DAY_MS, displayStringToDate } from '../../src/models/dateFunc';
import type { IItemData } from '../../src/models/Item';
import { IMilestoneData } from '../../src/models/Milestone';
import type { IProjectData } from '../../src/models/Project';
import { ITaskData } from '../../src/models/Task';
import { isCritical } from './ganttItems';
import { CRITICAL_COLOR } from '../../src/views/colors';

// Renderiza la sección de etiquetas (nombres de tareas, fechas y delay)
export function renderItemRowsFromProject(
  projectData: IProjectData,
  ganttLabelItems: HTMLElement,
  rowHeight: number
) {
  ganttLabelItems.innerHTML = '';

  const labelColumn = document.createElement('div');
  labelColumn.className = 'label-column';

  // Usar la función auxiliar para obtener una lista aplanada con profundidad
  const flattenedList = flattenItemsListWithDepth(projectData.items);

  for (const { item, depth } of flattenedList) {
    const color = isCritical(projectData, item) ? CRITICAL_COLOR : 'black';
    const labelRow = document.createElement('div');
    labelRow.className = 'label-row';
    labelRow.style.height = `${rowHeight}px`;
    labelRow.style.display = 'flex';

    // Columna 1: nombre de la tarea
    const name = document.createElement('div');
    name.style.width = '280px';
    name.style.overflow = 'hidden';
    name.style.textOverflow = 'ellipsis';
    name.style.color = color;
    name.style.paddingLeft = `${depth * 5}px`;
    name.textContent = item.name;

    // Columna 2: fecha de inicio
    const startDate = item.startDate || '-';
    const start = document.createElement('div');
    start.style.width = '90px';
    start.style.color = color;
    start.textContent = startDate;

    // Columna 3: número calculado personalizado
    const number = document.createElement('div');
    number.style.width = '30px';
    number.style.fontSize = '11px';
    const delayInDays = getDelayInDays(item)
    if (delayInDays !== 0) {
      number.style.color = 'red';
      number.style.fontSize = '10px';
      number.style.fontWeight = 'bold';
    }
    number.textContent = `${delayInDays}`;

    labelRow.appendChild(name);
    labelRow.appendChild(start);
    labelRow.appendChild(number);

    labelColumn.appendChild(labelRow);
  }

  ganttLabelItems.appendChild(labelColumn);
}

/**
 * Calculates the delay in days for an item.
 *
 * @param item The IItemData object (task, milestone, or process).
 * @returns The delay in days, or 0 if no delay or if the item is a process.
 */
export function getDelayInDays(item: IItemData): number {
  if (item.type === 'process') {
    return 0;
  }

  const actualStartDate = (item as ITaskData | IMilestoneData).actualStartDate
    ? displayStringToDate((item as ITaskData | IMilestoneData).actualStartDate!)
    : null;
  const calculatedStartDate = (item as ITaskData | IMilestoneData).calculatedStartDate
    ? displayStringToDate((item as ITaskData | IMilestoneData).calculatedStartDate!)
    : null;

  if (actualStartDate && calculatedStartDate) {
    const diffInMs = actualStartDate.getTime() - calculatedStartDate.getTime();
    return Math.ceil(diffInMs / DAY_MS);
  }

  return 0;
}