import jsPDF from "jspdf"
import type { IProjectData } from '../../src/models/Project';
import type { IItemData } from '../../src/models/Item';
import type { ITaskData } from '../../src/models/Task';
import type { IMilestoneData } from '../../src/models/Milestone';
import type { IProcessData } from '../../src/models/Process';
import { flattenItemsList } from '../../stores/project';
import { displayStringToDate } from '../../src/models/dateFunc';
import { CRITICAL_COLOR, hexToRgba } from '../../src/views/colors';
import { getTimeUnitsBetween, isCritical, Scale, SCALE_OPTIONS } from "../gantt/ganttHelpers";

// Conversión de Píxeles a Milímetros
const pxToMm = 0.264583;

// *** Función principal de dibujo de ítems ***
export function drawGanttItems(
  pdf: jsPDF,
  startX: number, // Posición X inicial del área del Gantt (en mm)
  startY: number, // Posición Y inicial del área del Gantt (en mm)
  projectData: IProjectData,
  calendarStartDate: Date,
  scale: Scale,
  rowHeight: number, // Altura de la fila en píxeles (se convertirá)
  criticalPathIndex: number | undefined,
): void {
  let rowIndex = 0;
  const rowHeightMm = rowHeight * pxToMm;

  const flattenedItems = flattenItemsList(projectData.items);

  for (const item of flattenedItems) {
    // La coordenada Y del centro de la barra o ícono, en mm
    const itemCenterY = startY + (rowIndex * rowHeightMm) + (rowHeightMm / 2);
    
    // Altura actual de la fila del item, en mm
    const currentItemY = startY + (rowIndex * rowHeightMm);

    if (item.type === 'milestone') {
      drawMilestone(pdf, startX, itemCenterY, projectData, item as IMilestoneData, calendarStartDate, scale, criticalPathIndex);
    } else if (item.type === 'task') {
      drawTask(pdf, startX, itemCenterY, projectData, item as ITaskData, calendarStartDate, scale, criticalPathIndex);
    } else if (item.type === 'process') {
      drawProcess(pdf, startX, itemCenterY, projectData, item as IProcessData, calendarStartDate, scale, criticalPathIndex);
    }

    rowIndex++;
  }
}

function drawMilestoneIcon(
  pdf: jsPDF,
  color: string,
  xMm: number, // Coordenada X del centro (en mm)
  yMm: number // Coordenada Y del centro (en mm)
): void {
  const sizePx = 6;
  const sizeMm = sizePx * pxToMm; // Tamaño en mm

  // Coordenadas del diamante [x, y]
  const points = [
    [xMm, yMm - sizeMm],      // Top
    [xMm + sizeMm, yMm],      // Right
    [xMm, yMm + sizeMm],      // Bottom
    [xMm - sizeMm, yMm],      // Left
    //
    [xMm, yMm - sizeMm],      // Top
  ];

  const [r, g, b] = hexToRgba(color);

  // Dibuja el diamante (Polígono)
  pdf.setFillColor(r, g, b);
  pdf.setDrawColor(0, 0, 0); // Borde negro
  pdf.setLineWidth(0.3);

  pdfPolygon(pdf, points, 'FD'); // Fill and Draw (Relleno y Borde)
}

function drawMilestone(
  pdf: jsPDF,
  startX: number, // Inicio X del área del Gantt (en mm)
  itemCenterY: number, // Centro Y del ítem (en mm)
  projectData: IProjectData,
  item: IMilestoneData,
  calendarStartDate: Date,
  scale: Scale,
  criticalPathIndex: number | undefined
): void {
  const start = displayStringToDate(item.startDate);
  if (!start) return;

  // 1. Calcular la posición X en PÍXELES
  const xPx =
    getTimeUnitsBetween(calendarStartDate, start, 'day') *
    SCALE_OPTIONS[scale].pxPerDay;
  
  // 2. Convertir a MM y sumar el offset inicial del Gantt
  const xMm = startX + (xPx * pxToMm);

  // Determinar el color
  const color = isCritical(projectData, item, criticalPathIndex)
    ? CRITICAL_COLOR
    : item.color || '#d9534f';

  drawMilestoneIcon(pdf, color, xMm, itemCenterY);

  drawLabelItem(pdf, item, xMm, itemCenterY);
}

function drawTask(
  pdf: jsPDF,
  startX: number, // Inicio X del área del Gantt (en mm)
  itemCenterY: number, // Centro Y del ítem (en mm)
  projectData: IProjectData,
  item: ITaskData,
  calendarStartDate: Date,
  scale: Scale,
  criticalPathIndex: number | undefined
): void {
  const start = displayStringToDate(item.startDate);
  const end = displayStringToDate(item.endDate);
  if (!start || !end) return;

  // 1. Calcular posiciones X en PÍXELES
  const xsPx =
    getTimeUnitsBetween(calendarStartDate, start, 'day') *
    SCALE_OPTIONS[scale].pxPerDay;
  const xePx =
    getTimeUnitsBetween(calendarStartDate, end, 'day') *
    SCALE_OPTIONS[scale].pxPerDay;

  // 2. Convertir a MM y sumar el offset inicial del Gantt
  const xsMm = startX + (xsPx * pxToMm);
  const widthMm = (xePx - xsPx) * pxToMm;

  // Determinar el color
  const colorHex = isCritical(projectData, item, criticalPathIndex)
    ? CRITICAL_COLOR
    : item.color || '#FF0000';

  const heightPx = 10;
  const heightMm = heightPx * pxToMm;
  const radiusMm = 5 * pxToMm; // Radio de esquina de 3px

  const [r, g, b, a] = hexToRgba(colorHex);

  // Dibuja la barra (Rectángulo)
  pdf.setFillColor(r, g, b);
  pdf.setDrawColor(r, g, b); // Usar el mismo color para el borde
  pdf.setLineWidth(0.1);
  
  // y: desde el centro hacia arriba (itemCenterY - heightMm/2)
  // rx/ry: jsPDF no soporta radios de esquina directamente en rect(), 
  // pero podemos usar el método 'roundedRect' si está disponible. Usaremos 'rect' simple por defecto.
  pdf.roundedRect(xsMm, itemCenterY - heightMm / 2, widthMm, heightMm, radiusMm, radiusMm, 'FD'); // Fill and Draw

  drawLabelItem(pdf, item, xsMm + widthMm, itemCenterY);
}

function drawProcessGroupBracket(
  pdf: jsPDF,
  xStartMm: number,
  xEndMm: number,
  yMm: number,
  color: string
): void {
  const triangleSizePx = 8;
  const triangleSizeMm = triangleSizePx * pxToMm;

  const yBase = yMm; // Línea horizontal
  const yTip = yMm + triangleSizeMm;

  const [r, g, b] = hexToRgba(color);
  
  pdf.setFillColor(r, g, b);
  pdf.setDrawColor(r, g, b); // Para los bordes, aunque los rellenamos
  pdf.setLineWidth(0.1);

  // Triángulo izquierdo
  const leftTriangle = [
    [xStartMm, yBase],
    [xStartMm + triangleSizeMm, yBase],
    [xStartMm + (triangleSizeMm / 2.5), yTip],
  ];
  pdfPolygon(pdf, leftTriangle, 'F'); // Solo Fill (Relleno)

  // Triángulo derecho
  const rightTriangle = [
    [xEndMm - triangleSizeMm, yBase],
    [xEndMm, yBase],
    [xEndMm - (triangleSizeMm / 2.5), yTip],
  ];
  pdfPolygon(pdf, rightTriangle, 'F'); // Solo Fill (Relleno)

  // Línea horizontal (Rectángulo delgado)
  const middleLineStartX = xStartMm + triangleSizeMm;
  const middleLineWidth = xEndMm - triangleSizeMm - middleLineStartX;
  const lineHeightMm = 1 * pxToMm; // Línea de 1px de alto

  pdf.rect(middleLineStartX, yBase - lineHeightMm / 2, middleLineWidth, lineHeightMm, 'F');
}

function drawProcess(
  pdf: jsPDF,
  startX: number, // Inicio X del área del Gantt (en mm)
  itemCenterY: number, // Centro Y del ítem (en mm)
  projectData: IProjectData,
  item: IProcessData,
  calendarStartDate: Date,
  scale: Scale,
  criticalPathIndex: number | undefined
): void {
  // Determinar el color
  const colorHex = isCritical(projectData, item, criticalPathIndex)
    ? CRITICAL_COLOR
    : item.color || '#666';
  const start = displayStringToDate(item.startDate);
  const end = displayStringToDate(item.endDate);
  if (!start || !end) return;

  // 1. Calcular posiciones X en PÍXELES (con el offset de 0.35 días)
  const xsPx =
    (getTimeUnitsBetween(calendarStartDate, start, 'day') - 0.35) *
    SCALE_OPTIONS[scale].pxPerDay;
  const xePx =
    (getTimeUnitsBetween(calendarStartDate, end, 'day') + 0.35) *
    SCALE_OPTIONS[scale].pxPerDay;

  // 2. Convertir a MM y sumar el offset inicial del Gantt
  const xsMm = startX + (xsPx * pxToMm);
  const xeMm = startX + (xePx * pxToMm);
  const widthMm = xeMm - xsMm;
  
  // Dibujar el corchete (triángulos y línea horizontal)
  drawProcessGroupBracket(pdf, xsMm, xeMm, itemCenterY, colorHex);

  // Dibujar la barra central
  const heightPx = 5;
  const heightMm = heightPx * pxToMm;
  const radiusMm = 3 * pxToMm;

  const [r, g, b] = hexToRgba(colorHex);

  pdf.setFillColor(r, g, b);
  pdf.setDrawColor(r, g, b);
  pdf.setLineWidth(0.1);
  
  pdf.roundedRect(xsMm, itemCenterY - heightMm / 2, widthMm, heightMm, radiusMm, radiusMm, 'F'); // Solo Fill (Relleno)

  drawLabelItem(pdf, item, xeMm, itemCenterY);
}

function drawLabelItem(
  pdf: jsPDF, 
  item: IItemData, 
  xEndMm: number, // Posición X donde termina la barra/ícono (en mm)
  yMm: number // Centro Y del ítem (en mm)
): void {
  const horizontalOffsetPx = 15; // Pequeño espacio a la derecha
  const horizontalOffsetMm = horizontalOffsetPx * pxToMm;

  pdf.setFontSize(7); // Usamos un tamaño de fuente pequeño para la etiqueta
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 51, 51); // #333

  // La posición Y se ajusta al centro vertical de la fila.
  // La posición X es (final de la barra + offset)
  pdf.text(item.name, xEndMm + horizontalOffsetMm, yMm + 0.5); // Ajuste de +0.5mm para centrado visual
}


/**
 * 
 */
// Se asume que esta función se define dentro del archivo donde se usa jsPDF.
// El formato de 'points' es un array de [x, y] absolutos.
export function pdfPolygon(
  pdf: jsPDF,
  points: number[][], // Array de coordenadas absolutas [[x1, y1], [x2, y2], ...]
  style: 'F' | 'D' | 'FD' = 'FD' // Fill, Draw, o Fill and Draw
): void {
  if (points.length < 3) return;

  // El primer punto es el punto de inicio absoluto para pdf.lines
  const startX = points[0][0];
  const startY = points[0][1];

  // Los puntos siguientes deben ser relativos al anterior: [dx, dy]
  const relativeLines: number[][] = [];

  for (let i = 1; i < points.length; i++) {
    const prevX = points[i - 1][0];
    const prevY = points[i - 1][1];
    const currX = points[i][0];
    const currY = points[i][1];

    // Calcular la diferencia (relativa al punto anterior)
    relativeLines.push([currX - prevX, currY - prevY]);
  }

  // Para cerrar la figura (opcional, jsPDF lo cierra si se usa 'F' o 'FD')
  // relativeLines.push([startX - points[points.length - 1][0], startY - points[points.length - 1][1]]);

  // Dibuja el polígono
  pdf.lines(relativeLines, startX, startY, [1, 1], style);
}