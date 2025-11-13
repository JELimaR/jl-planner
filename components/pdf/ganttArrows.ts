import jsPDF from "jspdf"
import type { IProjectData } from '../../src/models/Project';
import { flattenItemsList } from '../../stores/project';
import { CRITICAL_COLOR, hexToRgba } from '../../src/views/colors';
import { GANTT_CONFIG } from "./pdfGenerator"; // Se requiere para rowHeight
import { getXPositionEnd, getXPositionStart, isCriticalArrow, itemPositionLeft, itemPositionRight, Scale } from "../gantt/ganttHelpers";
import { pdfPolygon } from "./ganttItems";

// Constante de conversión
const pxToMm = 0.264583;

// Declarar o importar itemPositionLeft y itemPositionRight como Map<string, {x: number, y: number}>

export function drawAllArrows(
  pdf: jsPDF,
  startX: number, // Posición X inicial del área del Gantt (en mm)
  startY: number, // Posición Y inicial del área del Gantt (en mm)
  projectData: IProjectData, 
  calendarStartDate: Date,
  scale: Scale,
  rowHeight: number, // Altura de la fila en píxeles (se convertirá)
  criticalPathIndex: number | undefined
) {
  // Nota: addArrowHeadDef se elimina, la punta de flecha se dibuja con pdf.lines

  let rowIndex = 0;
  const rowHeightMm = rowHeight * pxToMm;
  const flattenedItems = flattenItemsList(projectData.items);
  
  // Limpiar mapas de posición antes de usarlos
  itemPositionLeft.clear();
  itemPositionRight.clear();

  // === PASO 1: Calcular posiciones absolutas en MM ===
  for (const item of flattenedItems) {
    if (item.type === 'task' || item.type === 'milestone') {
      const start = item.startDate ? new Date(item.startDate) : null;
      const end = item.endDate ? new Date(item.endDate) : null;
      if (!start || !end) continue;

      // Calcular posiciones en PÍXELES (relativas al inicio del calendario)
      const startXpx = getXPositionStart(item, calendarStartDate, scale);
      const endXpx = getXPositionEnd(item, calendarStartDate, scale);

      // Convertir a MM y sumar el offset de inicio del área Gantt (startX, startY)
      const xStartMm = startX + (startXpx * pxToMm);
      const xEndMm = startX + (endXpx * pxToMm);
      const centerYMm = startY + (rowIndex * rowHeightMm) + (rowHeightMm / 2);

      itemPositionLeft.set(item.id, { x: xStartMm, y: centerYMm });
      itemPositionRight.set(item.id, { x: xEndMm, y: centerYMm });
    }

    rowIndex++;
  }

  // === PASO 2: Dibujar flechas ===
  for (const item of flattenedItems) {
    if (item.type !== 'task' && item.type !== 'milestone') continue;

    const targetPos = itemPositionLeft.get(item.id);
    if (!targetPos) continue;

    for (const predId of item.predecessorIds) {
      const pred = flattenedItems.find(i => i.id === predId);
      if (!pred || (pred.type !== 'task' && pred.type !== 'milestone')) continue;

      const sourcePos = itemPositionRight.get(pred.id);
      if (!sourcePos) continue;

      const isCritical = isCriticalArrow(projectData, pred, item, criticalPathIndex);
      const color: string = isCritical ? CRITICAL_COLOR : '#555';
      
      drawArrow(
        pdf,
        sourcePos,
        targetPos,
        rowHeight, // Pasamos rowHeight en px (se convierte dentro de drawArrow)
        color,
        isCritical
      );
    }
  }
}


// Helper para dibujar la punta de flecha
function drawArrowHead(
  pdf: jsPDF,
  endX: number,
  endY: number,
  color: string,
  critical: boolean
) {
  const sizePx = critical ? 7 : 5; 
  const sizeMm = sizePx * pxToMm;

  // La flecha viene de la izquierda, la punta apunta a la derecha
  // Coordenadas absolutas:
  const points = [
      [endX - sizeMm, endY - sizeMm/2],  // Base superior
      [endX, endY],                     // Vértice (Target)
      [endX - sizeMm, endY + sizeMm/2],  // Base inferior
  ];

  const [r, g, b] = hexToRgba(color);

  pdf.setFillColor(r, g, b);
  pdf.setDrawColor(r, g, b); // Usar el mismo color para el borde
  pdf.setLineWidth(0.1); // Borde delgado

  // Reutilizamos el helper pdfPolygon para dibujar el triángulo
  pdfPolygon(pdf, points, 'F'); 
}


/**
 * Dibuja una flecha desde un item fuente hasta uno destino.
 * Estilo ortogonal: derecha → abajo → (si es necesario) izquierda → abajo → llegada.
 */
function drawArrow(
  pdf: jsPDF,
  source: { x: number; y: number },
  target: { x: number; y: number },
  rowHeight: number, // Altura de fila en PÍXELES
  color: string,
  critical: boolean
) {
  const offsetPx = 12; // margen inicial/final horizontal en px
  const downStepPx = rowHeight * 0.55;

  const offsetMm = offsetPx * pxToMm;
  const downStepMm = downStepPx * pxToMm;

  const sx = source.x; // mm
  const sy = source.y; // mm

  // El target x debe ser offset-menos ya que el círculo se dibuja en target.x
  const tx = target.x - offsetMm; // mm
  const ty = target.y; // mm

  const [r, g, b] = hexToRgba(color);
  const strokeWidthMm = (critical ? 3.0 : 0.7) * pxToMm;

  // Configuración de la línea
  pdf.setDrawColor(r, g, b);
  pdf.setLineWidth(strokeWidthMm);
  pdf.setLineCap('butt'); // Asegura que las líneas se unan bien

  // Simulación de línea punteada (stroke-dasharray)
  if (!critical) {
    // [longitud_linea, longitud_espacio] en mm
    pdf.setLineDashPattern([5 * pxToMm, 5 * pxToMm], 0); 
  } else {
    pdf.setLineDashPattern([], 0); // Línea continua
  }
  
  // === Definición de puntos absolutos para el camino ortogonal ===
  const points: number[][] = [];
  points.push([sx, sy]); // Punto inicial (1)

  const h1 = sx + offsetMm;
  points.push([h1, sy]); // Primer paso horizontal (2)

  if (h1 > tx) {
    const midY = sy + (ty > sy ? 1 : -1) * downStepMm;
    points.push([h1, midY]); // Baja (3)
    points.push([tx, midY]); // Cruza hacia izquierda (4)
  } else {
    points.push([h1, ty]); // Baja directamente a la altura de destino (3)
  }

  // Último segmento antes de la punta de flecha
  points.push([tx, ty]); // Baja a la altura del destino (4)
  points.push([target.x, ty]); // Entra al destino (5)
  

  // === Dibujo de la línea ===
  // Usamos pdf.lines con el primer punto absoluto y los siguientes relativos
  const relativeLines: number[][] = [];
  for (let i = 1; i < points.length; i++) {
      const prevX = points[i - 1][0];
      const prevY = points[i - 1][1];
      const currX = points[i][0];
      const currY = points[i][1];
      relativeLines.push([currX - prevX, currY - prevY]);
  }
  
  // Dibujar el camino
  pdf.lines(relativeLines, points[0][0], points[0][1], [1, 1], 'S'); // 'S' para Stroke

  // === Dibujo de los puntos de conexión ===
  // El código SVG dibujaba círculos: simularemos con rectángulos rellenos
  const circleSizeMm = (critical ? 3 : 2.5) * pxToMm;
  const fillRgb = hexToRgba('#555');

  pdf.setFillColor(...fillRgb);
  pdf.setDrawColor(...fillRgb);
  pdf.setLineWidth(0.1);
  pdf.setLineDashPattern([], 0); // Desactivar guiones para los puntos

  // Punto de salida (círculo)
  pdf.circle(sx, sy, circleSizeMm, 'F'); 

  // Punto de llegada (círculo)
  pdf.circle(target.x, target.y, circleSizeMm, 'F');
  
  // === Dibujar punta de flecha ===
  drawArrowHead(pdf, target.x, target.y, color, critical);
  
}


