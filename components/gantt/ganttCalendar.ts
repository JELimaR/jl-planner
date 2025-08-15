import { DAY_MS } from "../../src/models/dateFunc";
import { getTimeUnitsBetween, Scale, SCALE_OPTIONS } from "./ganttHelpers";


// Devuelve una fecha desplazada desde la inicial según el índice y la escala
export function getTickDate(start: Date, index: number, scale: Scale): Date {
  const date = new Date(start);
  if (scale === 'day') date.setDate(date.getDate() + index);
  if (scale === 'week') date.setDate(date.getDate() + index * 7);
  if (scale === 'month') date.setMonth(date.getMonth() + index);
  return date;
}

function formatToTwoDigits(num: number): string {
  return num < 10 ? `0${num}` : num.toString();
}
// Formatea una fecha como etiqueta de tick según la escala
export function formatTickLabel(date: Date, scale: Scale): string {
  if (scale === 'day')
    return `${formatToTwoDigits(date.getDate())}.${formatToTwoDigits(
      date.getMonth() + 1
    )}`;
  if (scale === 'week') {
    // Formato para la semana: "15-jul" o "Jul 15"
    const startOfWeek = new Date(date);
    startOfWeek.setDate(
      startOfWeek.getDate() -
        (startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1)
    ); // Lunes
    return startOfWeek.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  }
  if (scale === 'month')
    return date.toLocaleString('es-ES', { month: 'short' });
  return '';
}

// Helper para obtener días en un mes
export function getDaysInMonth(date: Date): number {
  const month = date.getMonth();
  const year = date.getFullYear();
  return new Date(year, month + 1, 0).getDate();
}

// Renderiza el encabezado de fechas (fila de años y fila de ticks)
export function renderDateRow(
  dateRow: HTMLElement,
  calendarStartDate: Date,
  calendarEndDate: Date,
  scale: Scale
) {
  dateRow.innerHTML = '';
  dateRow.className = 'gantt-dates';

  //const unitWidth = SCALE_OPTIONS[scale].pxPerUnit;
  const totalUnits = getTimeUnitsBetween(
    calendarStartDate,
    calendarEndDate,
    scale
  );

  const yearRow = document.createElement('div');
  yearRow.className = 'gantt-dates-year-row';

  const subRow = document.createElement('div');
  subRow.className = 'gantt-dates-sub-row';

  let currentYear = '';
  let currentYearWidth = 0;

  for (let i = 0; i < totalUnits; i++) {
    const tickDate = getTickDate(calendarStartDate, i, scale);
    const year = tickDate.getFullYear().toString();

    // calculamos el width total
    let unitWidth = SCALE_OPTIONS[scale].pxPerDay;
    switch (scale) {
      case 'day':
        unitWidth = SCALE_OPTIONS[scale].pxPerDay;
        break;
      case 'week':
        unitWidth = SCALE_OPTIONS[scale].pxPerDay * 7;
        break;
      case 'month':
        unitWidth = SCALE_OPTIONS[scale].pxPerDay * getDaysInMonth(tickDate);
    }

    // Crear bloque para subfecha
    const subTick = document.createElement('div');
    subTick.className = 'date-tick';
    subTick.style.width = `${unitWidth}px`;
    subTick.textContent = formatTickLabel(tickDate, scale);
    subRow.appendChild(subTick);

    if (i === 0 || year !== currentYear) {
      if (i > 0) {
        const yearDiv = document.createElement('div');
        yearDiv.className = 'year-block';
        yearDiv.style.width = `${currentYearWidth}px`;
        yearDiv.textContent = currentYear;
        yearRow.appendChild(yearDiv);
      }
      currentYear = year;
      currentYearWidth = unitWidth;
    } else {
      currentYearWidth += unitWidth;
    }
  }

  // Agrega último bloque de año
  if (currentYear) {
    const yearDiv = document.createElement('div');
    yearDiv.className = 'year-block';
    yearDiv.style.width = `${currentYearWidth}px`;
    yearDiv.textContent = currentYear;
    yearRow.appendChild(yearDiv);
  }

  dateRow.appendChild(yearRow);
  dateRow.appendChild(subRow);
}