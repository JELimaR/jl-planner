import type { Item } from '../models/Item';
import type { Project } from '../models/Project';
import { formatDateToDisplay } from '../models/dateFunc';
import { CRITICAL_COLOR } from './colors';

// Renderiza la sección de etiquetas (nombres de tareas, fechas y números)
export function renderItemRowsFromProject(
  project: Project,
  ganttLabelItems: HTMLElement,
  rowHeight: number
) {
  ganttLabelItems.innerHTML = '';

  const labelColumn = document.createElement('div');
  labelColumn.className = 'label-column';

  let currentRow = 0;

  project.traverse((item: Item, depth: number) => {
    const color = item.isCritical ? CRITICAL_COLOR : 'black';
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
    const startDate = formatDateToDisplay(item.getStartDate()!) ?? '-';
    const start = document.createElement('div');
    start.style.width = '90px';
    start.style.color = color;
    start.textContent = startDate;

    // Columna 3: número calculado personalizado
    const number = document.createElement('div');
    number.style.width = '30px';
    number.style.fontSize = `11px`;
    if (item.getDelayInDays()) {
      number.style.color = 'red';
      number.style.fontSize = `10px`;
      number.style.fontWeight = 'bold';
    }
    number.textContent = `${item.getDelayInDays()}`;

    labelRow.appendChild(name);
    labelRow.appendChild(start);
    labelRow.appendChild(number);

    labelColumn.appendChild(labelRow);
    currentRow++;
  });

  ganttLabelItems.appendChild(labelColumn);
}
