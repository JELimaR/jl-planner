import jsPDF from "jspdf"
import { IProjectData } from "../../src/models/Project"
import { GANTT_CONFIG } from "./pdfGenerator"
import { getCalendarLimitDates, getDelayInDays, getTimeUnitsBetween, isCritical, Scale, SCALE_OPTIONS } from "../gantt/ganttHelpers"
import { DAY_MS } from "../../src/models/dateFunc"
import { CRITICAL_COLOR } from "../../src/views/colors"
import { flattenItemsList, flattenItemsListWithDepth } from "../../stores/project"
import { formatTickLabel, getDaysInMonth, getTickDate } from "../gantt/ganttCalendar"
import { drawGanttItems } from "./ganttItems"
import { drawAllArrows } from "./ganttArrows"


// ============================================
// PÁGINA 2: GANTT
// ============================================

/**
 * Calcula las dimensiones de la página del Gantt
 */
export function calculateGanttPageDimensions(
  itemCount: number,
  projectStartDate: Date,
  projectEndDate: Date,
  currentScale: string
): {
  pageWidth: number
  pageHeight: number
  leftTableWidth: number
  ganttWidth: number
  ganttHeight: number
} {
  const { margin, headerHeight, rowHeight, calendarHeight } = GANTT_CONFIG
  const { itemColWidth: taskColWidth, startColWidth, delayColWidth } = GANTT_CONFIG.leftTable

  // Ancho de la tabla izquierda
  const leftTableWidth = (taskColWidth + startColWidth + delayColWidth) * 0.264583 // Convertir px a mm

  // Calcular ancho del Gantt basado en fechas y escala (igual que ganttRenderer)
  const { calendarStartDate, calendarEndDate } = getCalendarLimitDates(
    projectStartDate,
    projectEndDate,
    currentScale as any
  )

  // Calcular días totales entre fechas del calendario (con backup)
  const totalDays = (calendarEndDate.getTime() - calendarStartDate.getTime()) / DAY_MS

  // Calcular ancho en píxeles según la escala
  const ganttWidthPx = totalDays * SCALE_OPTIONS[currentScale].pxPerDay

  // Convertir a mm con mínimo de 200mm
  const ganttWidth = Math.max(200, ganttWidthPx * 0.264583)

  const ganttHeight = itemCount * rowHeight * 0.264583 // mm

  // Dimensiones de la página
  const pageWidth = Math.max(210, margin + leftTableWidth + ganttWidth + margin)
  const pageHeight = Math.max(297, headerHeight + calendarHeight + ganttHeight + (margin * 2))

  return {
    pageWidth,
    pageHeight,
    leftTableWidth,
    ganttWidth,
    ganttHeight
  }
}

/**
 * Dibuja el encabezado de la página del Gantt
 */
export function drawGanttHeader(
  pdf: jsPDF,
  title: string,
  scale: string,
  startY: number
): number {
  const { margin } = GANTT_CONFIG

  // Título
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text(title, margin, startY)

  // Información de escala
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Escala: ${scale}`, margin, startY + 15)

  return startY + 30 // Retorna la nueva posición Y
}

/**
 * Dibuja los headers de la tabla izquierda del Gantt
 */
export function drawGanttLeftTableHeaders(
  pdf: jsPDF,
  startX: number,
  startY: number
): number {
  const { itemColWidth, startColWidth, delayColWidth } = GANTT_CONFIG.leftTable
  const { headerGray } = GANTT_CONFIG.colors

  // Convertir px a mm
  const itemColMm = itemColWidth * 0.264583
  const startColMm = startColWidth * 0.264583
  const delayColMm = delayColWidth * 0.264583
  const headerHeight = GANTT_CONFIG.calendarHeight * 0.264583

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.3)

  // Header "Tarea"
  pdf.setFillColor(...headerGray)
  pdf.rect(startX, startY, itemColMm, headerHeight, 'FD')
  pdf.setTextColor(0, 0, 0)
  pdf.text('Tarea', startX + 2, startY + (headerHeight / 2) + 1)

  // Header "Inicio"
  pdf.setFillColor(...headerGray)
  pdf.rect(startX + itemColMm, startY, startColMm, headerHeight, 'FD')
  pdf.text('Inicio', startX + itemColMm + 2, startY + (headerHeight / 2) + 1)

  // Header "delay"
  pdf.setFontSize(9)
  pdf.setFillColor(...headerGray)
  pdf.rect(startX + itemColMm + startColMm, startY, delayColMm, headerHeight, 'FD')
  pdf.text('delay', startX + itemColMm + startColMm + 1, startY + (headerHeight / 2) + 1)

  return startY + headerHeight
}

/**
 * Dibuja las filas de la tabla izquierda del Gantt
 * Siguiendo la lógica de renderItemRowsFromProject en ganttLeftTable.ts
 */
export function drawGanttLeftTableRows(
  pdf: jsPDF,
  projectData: any,
  startX: number,
  startY: number
): void {
  const { itemColWidth, startColWidth, delayColWidth } = GANTT_CONFIG.leftTable
  const { rowHeight } = GANTT_CONFIG
  const { border } = GANTT_CONFIG.colors

  // Convertir px a mm
  const itemColMm = itemColWidth * 0.264583
  const startColMm = startColWidth * 0.264583
  const delayColMm = delayColWidth * 0.264583
  const rowHeightMm = rowHeight * 0.264583

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setDrawColor(...border)

  // Obtener lista aplanada con profundidad (igual que ganttRenderer)
  const flattenedList = flattenItemsListWithDepth(projectData.items)

  flattenedList.forEach(({ item, depth }: any, index: number) => {
    const rowY = startY + (index * rowHeightMm)

    // Determinar color (crítico = rojo)
    const isCriticalItem = isCritical(projectData, item, -1)
    const textColor = isCriticalItem ? CRITICAL_COLOR : 'black'

    // Convertir color hex a RGB
    let r = 0, g = 0, b = 0
    if (textColor === CRITICAL_COLOR) {
      // CRITICAL_COLOR es '#DC143C'
      r = 220
      g = 20
      b = 60
    }

    // Dibujar bordes de las celdas
    pdf.rect(startX, rowY, itemColMm, rowHeightMm)
    pdf.rect(startX + itemColMm, rowY, startColMm, rowHeightMm)
    pdf.rect(startX + itemColMm + startColMm, rowY, delayColMm, rowHeightMm)

    // Columna 1: Nombre de la tarea con indentación
    pdf.setTextColor(r, g, b)
    const indentMm = (depth * 5) * 0.264583
    let itemName = item.name || ''
    if (itemName.length > 35) {
      itemName = itemName.substring(0, 32) + '...'
    }
    pdf.text(itemName, startX + indentMm + 2, rowY + (rowHeightMm / 2) + 1)

    // Columna 2: Fecha de inicio
    pdf.text(item.startDate || '-', startX + itemColMm + 2, rowY + (rowHeightMm / 2) + 1)

    // Columna 3: Delay
    const delayInDays = getDelayInDays(item)
    if (delayInDays !== 0) {
      pdf.setTextColor(255, 0, 0) // Rojo para delays
      pdf.setFontSize(7)
    }
    pdf.text(delayInDays.toString(), startX + itemColMm + startColMm + 2, rowY + (rowHeightMm / 2) + 1)

    // Resetear tamaño de fuente
    pdf.setFontSize(8)
  })

  // Resetear color
  pdf.setTextColor(0, 0, 0)
}

/**
 * 
 */
export function drawGanttCalendar(
  pdf: jsPDF,
  startX: number, // Inicio X del área del calendario (después de la tabla izquierda)
  startY: number, // Inicio Y del área del calendario
  calendarStartDate: Date,
  calendarEndDate: Date,
  scale: Scale
): void {
  const { calendarHeight } = GANTT_CONFIG;
  const { headerGray, border } = GANTT_CONFIG.colors;

  // Convertir px a mm (0.264583mm/px)
  const pxToMm = 0.264583;
  const headerHeightMm = calendarHeight * pxToMm; // Altura total del calendario (fila de años + fila de ticks)
  const yearRowHeightMm = headerHeightMm / 2;
  const subRowHeightMm = headerHeightMm / 2;

  const totalUnits = getTimeUnitsBetween(
    calendarStartDate,
    calendarEndDate,
    scale
  );

  let currentYear = '';
  let currentYearWidthPx = 0;
  let currentYearStartX = startX; // Posición X donde comienza el bloque del año
  let currentTickX = startX; // Posición X para el tick actual

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setDrawColor(...border);
  pdf.setLineWidth(0.2);

  for (let i = 0; i < totalUnits; i++) {
    const tickDate = getTickDate(calendarStartDate, i, scale);
    const year = tickDate.getFullYear().toString();

    // 1. Calcular el ancho del tick en PÍXELES y luego en MM
    let unitWidthPx = SCALE_OPTIONS[scale].pxPerDay;
    switch (scale) {
      case 'day':
        unitWidthPx = SCALE_OPTIONS[scale].pxPerDay;
        break;
      case 'week':
        unitWidthPx = SCALE_OPTIONS[scale].pxPerDay * 7;
        break;
      case 'month':
        unitWidthPx = SCALE_OPTIONS[scale].pxPerDay * getDaysInMonth(tickDate);
        break;
    }
    const unitWidthMm = unitWidthPx * pxToMm;

    // =================================
    // DIBUJAR EL TICK (subRow)
    // =================================
    // Fondo del tick
    pdf.setFillColor(...headerGray);
    pdf.rect(currentTickX, startY + yearRowHeightMm, unitWidthMm, subRowHeightMm, 'FD');
    // Borde lateral del tick (opcional, el rect lo dibuja)
    // pdf.line(currentTickX, startY + yearRowHeightMm, currentTickX, startY + headerHeightMm);

    // Texto del tick
    const tickLabel = formatTickLabel(tickDate, scale);
    // Centrar texto: (Ancho / 2) - (AnchoTexto / 2) -> (unitWidthMm / 2) - (pdf.getTextWidth(tickLabel) / 2)
    pdf.setTextColor(0, 0, 0);
    pdf.text(tickLabel, currentTickX + (unitWidthMm / 2), startY + yearRowHeightMm + (subRowHeightMm / 2) + 0.5, { align: 'center' });

    // =================================
    // LÓGICA Y DIBUJO DE LA FILA DE AÑOS (yearRow)
    // =================================
    if (i === 0 || year !== currentYear) {
      // Si no es el primer elemento, dibujar el bloque de año anterior
      if (i > 0) {
        const yearBlockWidthMm = currentYearWidthPx * pxToMm;

        // Dibujar bloque del año anterior
        pdf.setFillColor(...headerGray);
        pdf.rect(currentYearStartX, startY, yearBlockWidthMm, yearRowHeightMm, 'FD');

        // Texto del año anterior (centrado)
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(currentYear, currentYearStartX + (yearBlockWidthMm / 2), startY + (yearRowHeightMm / 2) + 1, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
      }

      // Iniciar nuevo bloque de año
      currentYear = year;
      currentYearWidthPx = unitWidthPx;
      currentYearStartX = currentTickX; // El nuevo bloque comienza donde terminó el anterior
    } else {
      // Continuar bloque de año actual
      currentYearWidthPx += unitWidthPx;
    }

    // Avanzar la posición X para el siguiente tick
    currentTickX += unitWidthMm;
  }

  // Agregar último bloque de año
  if (currentYear) {
    const yearBlockWidthMm = currentYearWidthPx * pxToMm;

    // Dibujar bloque del último año
    pdf.setFillColor(...headerGray);
    pdf.rect(currentYearStartX, startY, yearBlockWidthMm, yearRowHeightMm, 'FD');

    // Texto del último año (centrado)
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(currentYear, currentYearStartX + (yearBlockWidthMm / 2), startY + (yearRowHeightMm / 2) + 1, { align: 'center' });
  }

  // Restaurar configuración de fuente/color
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
}

/**
 * Dibuja el contenido completo del Gantt
 * Placeholder vacío listo para integrar con ganttRenderer
 */
export function drawGanttContent(
  pdf: jsPDF,
  startX: number,
  startY: number,
  projectData: IProjectData,
  calendarStartDate: Date,
  scale: Scale,
): void {
  const rowHeight= GANTT_CONFIG.rowHeight
  drawGanttItems(pdf, startX, startY, projectData, calendarStartDate, scale, rowHeight, undefined)
  drawAllArrows(pdf, startX, startY, projectData, calendarStartDate, scale, rowHeight, undefined)
}


/**
 * Genera la segunda página con el Gantt
 */
export function generateGanttPage(
  pdf: jsPDF,
  projectData: IProjectData,
  projectStartDate: Date,
  projectEndDate: Date,
  currentScale: Scale = 'week'
): void {
  const flattenedItems = flattenItemsList(projectData.items)
  const dimensions = calculateGanttPageDimensions(
    flattenedItems.length,
    projectStartDate,
    projectEndDate,
    currentScale
  )

  // Agregar nueva página
  pdf.addPage([dimensions.pageWidth, dimensions.pageHeight], "l")

  console.log(`Página Gantt creada: ${dimensions.pageWidth}mm x ${dimensions.pageHeight}mm`)
  console.log(`Ancho del Gantt: ${dimensions.ganttWidth}mm`)

  const { margin } = GANTT_CONFIG

  // Obtener label de la escala
  const scaleLabel = SCALE_OPTIONS[currentScale]?.label || 'Semana'

  // Dibujar encabezado
  let currentY = margin + 15
  currentY = drawGanttHeader(pdf, 'Diagrama de Gantt', scaleLabel, currentY)

  // Dibujar calendario
  const ganttCalendarStartX = margin + dimensions.leftTableWidth
  const ganttCalendarStartY = currentY;
  const { calendarStartDate, calendarEndDate } = getCalendarLimitDates(projectStartDate, projectEndDate, currentScale)
  drawGanttCalendar(pdf, ganttCalendarStartX, ganttCalendarStartY, calendarStartDate, calendarEndDate, currentScale)

  // Dibujar tabla izquierda
  const leftTableStartX = margin
  currentY = drawGanttLeftTableHeaders(pdf, leftTableStartX, currentY)
  drawGanttLeftTableRows(pdf, projectData, leftTableStartX, currentY)

  // Dibujar área del Gantt (vacía por ahora)
  const ganttAreaStartX = leftTableStartX + dimensions.leftTableWidth
  const ganttAreaStartY = currentY
  const ganttAreaWidth = dimensions.ganttWidth
  const ganttAreaHeight = dimensions.ganttHeight

  drawGanttContent(pdf, ganttAreaStartX, ganttAreaStartY, projectData, calendarStartDate, currentScale)
}