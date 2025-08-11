import type { IProjectData } from '../models/Project';
import type { IItemData } from '../models/Item';
import type { ITaskData } from '../models/Task';
import type { IMilestoneData } from '../models/Milestone';
import type { IProcessData } from '../models/Process';
import { flattenItemsList } from '../../stores/project';
import { CRITICAL_COLOR } from './colors';
import { getTimeUnitsBetween, SCALE_OPTIONS, type Scale } from './ganttHelpers';
import { displayStringToDate } from '../models/dateFunc';

/**
 * Determina si un ítem es parte de la ruta crítica del proyecto.
 * @param projectData El objeto de datos del proyecto completo.
 * @param item El ítem a verificar.
 * @returns `true` si el ítem es parte de la ruta crítica, de lo contrario `false`.
 */
export function isCritical(projectData: IProjectData, item: IItemData): boolean {
  const criticalPaths = projectData.criticalPaths;
  
  if (!criticalPaths || criticalPaths.length === 0) {
    return false;
  }

  for (const path of criticalPaths) {
    if (path.path.some(criticalItem => criticalItem.id === item.id)) {
      return true;
    }
  }

  return false;
}

// *** Función principal de dibujo ***
export function drawItems(
  projectData: IProjectData,
  svg: SVGSVGElement,
  calendarStartDate: Date,
  scale: Scale,
  rowHeight: number
): void {
  let rowIndex = 0;
  
  const flattenedItems = flattenItemsList(projectData.items);

  for (const item of flattenedItems) {
    const y = rowIndex * rowHeight + rowHeight / 2;

    if (item.type === 'milestone') {
      drawMilestone(svg, projectData, item as IMilestoneData, calendarStartDate, scale, y);
    } else if (item.type === 'task') {
      drawTask(svg, projectData, item as ITaskData, calendarStartDate, scale, y);
    } else if (item.type === 'process') {
      drawProcess(svg, projectData, item as IProcessData, calendarStartDate, scale, y);
    }

    rowIndex++;
  }
}

// ... Las funciones auxiliares de dibujo de elementos se refactorizan a continuación ...

function drawMilestoneIcon(
  svg: SVGSVGElement,
  color: string,
  x: number,
  y: number
) {
  const size = 6;
  const points = [
    [x, y - size],
    [x + size, y],
    [x, y + size],
    [x - size, y],
  ]
    .map((p) => p.join(','))
    .join(' ');

  const diamond = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'polygon'
  );
  diamond.setAttribute('points', points);
  diamond.setAttribute('fill', color);
  diamond.setAttribute('stroke', '#000');
  diamond.setAttribute('stroke-width', '1');

  svg.appendChild(diamond);
}

function drawMilestone(
  svg: SVGSVGElement,
  projectData: IProjectData, // Nuevo argumento
  item: IMilestoneData,
  calendarStartDate: Date,
  scale: Scale,
  y: number
) {
  const start = displayStringToDate(item.startDate)!;
  const x =
    getTimeUnitsBetween(calendarStartDate, start, 'day') *
    SCALE_OPTIONS[scale].pxPerDay;

  // Sustitución de item.isCritical por la nueva función
  const color = isCritical(projectData, item)
    ? CRITICAL_COLOR
    : item.color || '#d9534f';
  drawMilestoneIcon(svg, color, x, y);

  drawLabelItem(svg, item, x, y);
}

function drawTask(
  svg: SVGSVGElement,
  projectData: IProjectData, // Nuevo argumento
  item: ITaskData,
  calendarStartDate: Date,
  scale: Scale,
  y: number
): void {
  const start = displayStringToDate(item.startDate);
  const end = displayStringToDate(item.endDate);
  if (!start || !end) return;

  const xs =
    getTimeUnitsBetween(calendarStartDate, start, 'day') *
    SCALE_OPTIONS[scale].pxPerDay;
  const xe =
    getTimeUnitsBetween(calendarStartDate, end, 'day') *
    SCALE_OPTIONS[scale].pxPerDay;

  const height = 10;
  const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bar.setAttribute('x', xs.toString());
  bar.setAttribute('y', (y - height / 2).toString());
  bar.setAttribute('width', (xe - xs).toString());
  bar.setAttribute('height', height.toString());
  
  // Sustitución de item.isCritical por la nueva función
  const color = isCritical(projectData, item)
    ? CRITICAL_COLOR
    : item.color || '#FF0000';
  bar.setAttribute('fill', color);
  bar.setAttribute('rx', '5');
  bar.setAttribute('ry', '5');

  svg.appendChild(bar);

  drawLabelItem(svg, item, xe, y);
}

function drawProcess(
  svg: SVGSVGElement,
  projectData: IProjectData, // Nuevo argumento
  item: IProcessData,
  calendarStartDate: Date,
  scale: Scale,
  y: number
): void {
  // Sustitución de item.isCritical por la nueva función
  const color = isCritical(projectData, item)
    ? CRITICAL_COLOR
    : item.color || '#666';
  const start = displayStringToDate(item.startDate);
  const end = displayStringToDate(item.endDate);
  if (!start || !end) return;

  const xs =
    (getTimeUnitsBetween(calendarStartDate, start, 'day') - 0.35) *
    SCALE_OPTIONS[scale].pxPerDay;
  const xe =
    (getTimeUnitsBetween(calendarStartDate, end, 'day') + 0.35) *
    SCALE_OPTIONS[scale].pxPerDay;

  drawProcessGroupBracket(svg, xs, xe, y, color);

  const height = 5;
  const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bar.setAttribute('x', xs.toString());
  bar.setAttribute('y', (y - height / 2).toString());
  bar.setAttribute('width', (xe - xs).toString());
  bar.setAttribute('height', height.toString());
  bar.setAttribute('fill', color);
  bar.setAttribute('rx', '3');
  bar.setAttribute('ry', '3');

  svg.appendChild(bar);

  drawLabelItem(svg, item, xe, y);
}

function drawProcessGroupBracket(
  svg: SVGSVGElement,
  xStart: number,
  xEnd: number,
  y: number,
  color: string
) {
  const triangleSize = 8;

  const yBase = y; // Línea horizontal
  const yTip = y + triangleSize;

  // Coordenadas del triángulo izquierdo
  const leftTriangle = [
    [xStart, yBase], // base izquierda
    [xStart + triangleSize, yBase], // base derecha
    [xStart + triangleSize / 2.5, yTip], // vértice abajo
  ];

  // Coordenadas del triángulo derecho
  const rightTriangle = [
    [xEnd - triangleSize, yBase],
    [xEnd, yBase],
    [xEnd - triangleSize / 2.5, yTip],
  ];

  // Línea horizontal entre triángulos
  const middleLine = [
    [xStart + triangleSize, yBase],
    [xEnd - triangleSize, yBase],
  ];

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', color);
  path.setAttribute('stroke', 'none');

  let d = 'M ' + leftTriangle[0].join(',') + ' ';
  for (let i = 1; i < leftTriangle.length; i++) {
    d += 'L ' + leftTriangle[i].join(',') + ' ';
  }
  d += 'Z ';

  d += 'M ' + rightTriangle[0].join(',') + ' ';
  for (let i = 1; i < rightTriangle.length; i++) {
    d += 'L ' + rightTriangle[i].join(',') + ' ';
  }
  d += 'Z ';

  d += `M ${middleLine[0].join(',')} L ${middleLine[1].join(',')}`;

  path.setAttribute('d', d);
  svg.appendChild(path);
}

function drawLabelItem(svg: SVGSVGElement, item: IItemData, x: number, y: number) {
  const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('x', (x + 15).toString()); // pequeño espacio a la derecha
  label.setAttribute('y', (y + 4).toString()); // ajuste vertical
  label.setAttribute('fill', '#333');
  label.setAttribute('font-size', '10px');
  label.setAttribute('font-family', 'monospace');
  label.textContent = item.name;

  svg.appendChild(label);
}
