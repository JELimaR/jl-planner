import type { IProjectData } from '../../src/models/Project';
import { flattenItemsList } from '../../stores/project';

import { getCalendarLimitDates, renderDateRow } from './ganttCalendar';
import { drawAllArrows } from './ganttDrawAllArrows';
import { SCALE_OPTIONS, type Scale } from './ganttHelpers';
import { drawItems } from './ganttItems';
import { renderItemRowsFromProject } from './ganttLeftTable';
import { DAY_MS, displayStringToDate } from '../../src/models/dateFunc';

// Función principal que renderiza el Gantt completo
export function ganttRenderer(
  projectData: IProjectData, 
  currentScale: Scale,
  container: HTMLElement,
  criticalPathIndex: number | undefined,
) {
  if (!projectData) return;

  // Fechas: Acceso directo a las propiedades de projectData
  const projectStartDate: Date = displayStringToDate(projectData.startDate);
  const projectEndDate: Date = displayStringToDate(projectData.endDate);
  
  let { calendarStartDate, calendarEndDate } = getCalendarLimitDates(
    projectStartDate,
    projectEndDate,
    currentScale
  );

  // Ítems: Se usa la lista aplanada del store
  const flattenedItems = flattenItemsList(projectData.items);
  
  // Otros parámetros
  const rowHeight = 20;
  const svgWidth =
    ((calendarEndDate.getTime() - calendarStartDate.getTime()) / DAY_MS) *
    SCALE_OPTIONS[currentScale].pxPerDay;
  const svgHeigth = flattenedItems.length * rowHeight;

  // Se vacia el contenido del container
  container.innerHTML = '';

  // envolvente del gantt
  const wrapper = document.createElement('div');
  wrapper.id = 'gantt-wrapper';
  wrapper.className = 'gantt-wrapper';

  const labels = document.createElement('div');
  labels.className = 'gantt-labels';

  // Encabezado de columnas
  const labelHeader = document.createElement('div');
  labelHeader.className = 'gantt-label-header';
  labelHeader.style.display = 'flex';

  const h1 = document.createElement('div');
  h1.textContent = 'Tarea';
  h1.style.width = '280px';

  const h2 = document.createElement('div');
  h2.textContent = 'Inicio';
  h2.style.width = '90px';

  const h3 = document.createElement('div');
  h3.textContent = 'delay';
  h3.style.fontSize = '11px';
  h3.style.width = '40px';

  labelHeader.appendChild(h1);
  labelHeader.appendChild(h2);
  labelHeader.appendChild(h3);
  labels.appendChild(labelHeader);

  // Contenedor de gráfico
  const chartWrapper = document.createElement('div');
  chartWrapper.className = 'gantt-chart';

  // Fila de fechas
  const dateRow = document.createElement('div');
  renderDateRow(dateRow, calendarStartDate, calendarEndDate, currentScale);
  chartWrapper.appendChild(dateRow);

  // SVG para barras del Gantt
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', `${svgWidth}`);
  svg.setAttribute('height', `${svgHeigth}`);
  chartWrapper.appendChild(svg);

  // Fila de datos
  const ganttLabelItems = document.createElement('div');
  renderItemRowsFromProject(projectData, ganttLabelItems, rowHeight);
  labels.appendChild(ganttLabelItems);

  // items
  drawItems(projectData, svg, calendarStartDate, currentScale, rowHeight, criticalPathIndex);
  
  // flechas
  drawAllArrows(svg, projectData, calendarStartDate, currentScale, rowHeight, criticalPathIndex);

  wrapper.appendChild(labels);
  wrapper.appendChild(chartWrapper);
  container.appendChild(wrapper);
}