import type { jsPDF } from 'jspdf'
import type { IItemData } from '../../src/models/Item'
import type { ITaskData } from '../../src/models/Task'
import { flattenItemsList, flattenItemsListWithDepth } from '../../stores/project'
import { getDelayInDays, isCritical, getCalendarLimitDates, SCALE_OPTIONS, type Scale } from '../gantt/ganttHelpers'
import { calculateBrightness, CRITICAL_COLOR, hexToRgba } from '../../src/views/colors'
import { DAY_MS, displayStringToDate, TDateString } from '../../src/models/dateFunc'
import { IProjectData } from '../../src/models/Project'
import { generateGanttPage } from './ganttPage'

// ============================================
// CONSTANTES DE CONFIGURACIÓN
// ============================================

export const PDF_CONFIG = {
  margin: 20,
  pageHeaderHeight: 80,
  sectionTitleHeight: 25,
  tableHeaderHeight: 15,
  rowHeight: 12,
  minPageHeight: 297, // A4 estándar

  // Anchos de columnas de la tabla
  columnWidths: {
    id: 15,
    name: 40,
    detail: 35,
    duration: 20,
    startDate: 25,
    endDate: 25,
    dependencies: 30
  },

  // Colores
  colors: {
    headerBackground: [66, 139, 202] as [number, number, number],
    headerText: 255,
    lineColor: [200, 200, 200] as [number, number, number],
    headerGray: [248, 249, 250] as [number, number, number]
  }
}

export const GANTT_CONFIG = {
  margin: 20,
  headerHeight: 60,
  rowHeight: 20,
  calendarHeight: 40, // Años (22) + Ticks (18)

  // Dimensiones de la tabla izquierda
  leftTable: {
    itemColWidth: 280,
    startColWidth: 90,
    delayColWidth: 40
  },

  // Colores
  colors: {
    background: [255, 255, 255] as [number, number, number],
    headerGray: [244, 244, 244] as [number, number, number],
    border: [230, 230, 230] as [number, number, number],
    calendarBorder: [200, 200, 200] as [number, number, number],
    gridLine: [224, 224, 224] as [number, number, number]
  }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Calcula el ancho total de la tabla
 */
export function calculateTableWidth(): number {
  const { columnWidths } = PDF_CONFIG
  return Object.values(columnWidths).reduce((sum, width) => sum + width, 0)
}

/**
 * Calcula las dimensiones de la página
 */
export function calculatePageDimensions(tableDataLength: number): {
  pageWidth: number
  pageHeight: number
  tableWidth: number
  startX: number
} {
  const { margin, pageHeaderHeight, sectionTitleHeight, tableHeaderHeight, rowHeight, minPageHeight } = PDF_CONFIG

  const tableWidth = calculateTableWidth()
  const tableHeight = tableHeaderHeight + (tableDataLength * rowHeight)

  // Ancho de página con márgenes generosos para centrado
  const pageWidth = tableWidth + (margin * 4)

  // Altura de página dinámica
  const pageHeight = Math.max(
    minPageHeight,
    pageHeaderHeight + sectionTitleHeight + tableHeight + (margin * 2)
  )

  // Posición X centrada para el contenido
  const contentWidth = tableWidth + (margin * 2)
  const startX = (pageWidth - contentWidth) / 2 + margin

  return { pageWidth, pageHeight, tableWidth, startX }
}

// ============================================
// PREPARACIÓN DE DATOS
// ============================================

/**
 * Prepara los datos de la tabla desde los items del proyecto
 */
export function prepareTableData(items: IItemData[]): string[][] {
  return items.map((item: IItemData) => [
    item.id?.toString() || '',
    item.name || '',
    item.detail || '',
    item.type === 'task' ? (item as ITaskData).duration?.toString() || '-' : '-',
    item.startDate || '',
    item.endDate || '',
    item.id === 1002 ? '' : item.predecessorIds.filter(pi => pi !== 1000).join(', ')
  ])
}

// ============================================
// RENDERIZADO DE SECCIONES
// ============================================

/**
 * Dibuja el encabezado del documento (título y subtítulos)
 */
export function drawDocumentHeader(
  pdf: jsPDF,
  projectData: IProjectData,
  pageWidth: number,
  startX: number
): void {
  const { margin } = PDF_CONFIG

  // Título centrado
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  const titleWidth = pdf.getTextWidth('Reporte')
  pdf.text('Reporte del Proyecto', (pageWidth - titleWidth) / 2, margin + 10)

  // Subtítulos alineados a la izquierda
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Proyecto: ${projectData.title || 'Sin título'}`, startX, margin + 25)
  pdf.setFontSize(11)
  pdf.text(`D: ${projectData.subtitle || 'Sin título'}`, startX, margin + 35)
  pdf.text(`Generado: ${new Date().toLocaleDateString()}`, startX, margin + 45)

  // Línea separadora
  pdf.setLineWidth(0.5)
  pdf.line(startX, margin + 55, pageWidth - startX, margin + 55)
}

/**
 * Dibuja el título de una sección
 */
export function drawSectionTitle(
  pdf: jsPDF,
  title: string,
  startX: number,
  y: number
): number {
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text(title, startX, y)
  return y + 15 // Retorna la nueva posición Y
}

/**
 * Configura los estilos de la tabla
 */
export function getTableStyles() {
  const { colors, columnWidths } = PDF_CONFIG

  return {
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak' as const,
      halign: 'left' as const
    },
    headStyles: {
      fillColor: colors.headerBackground,
      textColor: colors.headerText,
      fontSize: 9,
      fontStyle: 'bold' as const
    },
    columnStyles: {
      0: { cellWidth: columnWidths.id },
      1: { cellWidth: columnWidths.name },
      2: { cellWidth: columnWidths.detail },
      3: { cellWidth: columnWidths.duration },
      4: { cellWidth: columnWidths.startDate },
      5: { cellWidth: columnWidths.endDate },
      6: { cellWidth: columnWidths.dependencies }
    }
  }
}

/**
 * Callback para personalizar las celdas de la tabla
 */
export function createTableCellCallback(items: IItemData[]) {
  return function (data: any) {
    if (data.section === 'body') {
      const rowIndex = data.row.index
      const item = items[rowIndex]

      if (item && item.color) {
        const [r, g, b, a] = hexToRgba(item.color)
        data.cell.styles.fillColor = [r, g, b];
        (data.cell as any).alphaValue = a

        const brightness = calculateBrightness(r, g, b)
        data.cell.styles.textColor = brightness > 128 ? [0, 0, 0] : [255, 255, 255]
      }
    }
  }
}

// ============================================
// FUNCIÓN PRINCIPAL DE GENERACIÓN
// ============================================

/**
 * Genera el PDF completo del reporte
 */
export async function generateProjectReport(
  projectData: IProjectData,
  projectStartDate: TDateString,
  projectEndDate: TDateString,
  currentScale: Scale = 'week'
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const items = flattenItemsList(projectData.items)

  // ========== PÁGINA 1: TABLA DE TAREAS ==========

  // Preparar datos
  const tableData = prepareTableData(items)
  const dimensions = calculatePageDimensions(tableData.length)

  // Crear PDF
  const pdf = new jsPDF('p', 'mm', [dimensions.pageWidth, dimensions.pageHeight])

  console.log(`Página 1 creada: ${dimensions.pageWidth}mm x ${dimensions.pageHeight}mm`)

  // Dibujar encabezado
  drawDocumentHeader(pdf, projectData, dimensions.pageWidth, dimensions.startX)

  // Dibujar título de sección
  let currentY = PDF_CONFIG.margin + 70
  currentY = drawSectionTitle(pdf, 'Tabla de Tareas', dimensions.startX, currentY)

  // Generar tabla
  if (items.length > 0) {
    const headers = ['ID', 'Nombre', 'Detalle', 'Duración', 'Inicio', 'Fin', 'Dependencias']
    const tableStyles = getTableStyles()

    autoTable(pdf, {
      head: [headers],
      body: tableData,
      startY: currentY,
      margin: { left: dimensions.startX, right: dimensions.startX },
      ...tableStyles,
      didParseCell: createTableCellCallback(items)
    })
  }

  // ========== PÁGINA 2: GANTT ==========

  // Convertir fechas de string a Date
  const startDate = displayStringToDate(projectStartDate)
  const endDate = displayStringToDate(projectEndDate)

  generateGanttPage(pdf, projectData, startDate, endDate, currentScale)

  // ========== DESCARGAR PDF ==========

  const filename = `${projectData._id}.pdf`
  pdf.save(filename)

  console.log('PDF generado exitosamente:', filename)
}
