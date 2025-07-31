import type { Project } from '../models/Project';
import { getCalendarLimitDates, renderDateRow } from './ganttCalendar';
import { drawAllArrows } from './ganttDrawAllArrows';
import { DAY_MS, SCALE_OPTIONS, type Scale } from './ganttHelpers';
import { drawItems } from './ganttItems';
import { renderItemRowsFromProject } from './ganttLeftTable';

// Función principal que renderiza el Gantt completo
export function ganttRenderer(project: Project, currentScale: Scale) {
  project.getCriticalPaths();
  const container = document.getElementById('gantt-container');
  if (!container) return;

  // fechas
  const projectStartDate: Date = project.getProjectStartDate();
  const projectEndDate: Date = project.getProjectEndDate();
  let { calendarStartDate, calendarEndDate } = getCalendarLimitDates(
    projectStartDate,
    projectEndDate,
    currentScale
  );
  // otros parametros
  const rowHeight = 20;
  const svgWidth =
    ((calendarEndDate.getTime() - calendarStartDate.getTime()) / DAY_MS) *
    SCALE_OPTIONS[currentScale].pxPerDay;
  const svgHeigth = project.getAllItems().size * rowHeight;

  // se vacia el contenido del container
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
  renderItemRowsFromProject(project, ganttLabelItems, rowHeight);
  labels.appendChild(ganttLabelItems);

  // items
  drawItems(project, svg, calendarStartDate, currentScale, rowHeight);

  // flechas
  drawAllArrows(svg, project, calendarStartDate, currentScale, rowHeight);

  wrapper.appendChild(labels);
  wrapper.appendChild(chartWrapper);
  container.appendChild(wrapper);
}
