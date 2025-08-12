import { DAY_MS } from "../../src/models/dateFunc";
import { getTimeUnitsBetween, Scale, SCALE_OPTIONS } from "./ganttHelpers";


// Devuelve una fecha desplazada desde la inicial según el índice y la escala
function getTickDate(start: Date, index: number, scale: Scale): Date {
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
function formatTickLabel(date: Date, scale: Scale): string {
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
function getDaysInMonth(date: Date): number {
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

/****************************************************************************** */
export function getCalendarLimitDates(
  projectStartDate: Date,
  projectEndDate: Date,
  currentScale: Scale
) {
  let calendarStartDate: Date;
  let calendarEndDate: Date;
  // --- Calculate calendarStartDate ---
  if (currentScale === 'week') {
    // Start at least 30 days before project start
    const tentativeStartDate = new Date(
      projectStartDate.getTime() - 30 * DAY_MS
    );

    // Find the Monday closest to or before the tentativeStartDate
    calendarStartDate = new Date(tentativeStartDate);
    const dayOfWeek = calendarStartDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // If it's Sunday, go back 6 days to the previous Monday.
    // Otherwise, go back (dayOfWeek - 1) days to the current/previous Monday.
    calendarStartDate.setDate(
      calendarStartDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    );

    // Set time to beginning of the day to ensure consistency
    calendarStartDate.setHours(0, 0, 0, 0);
  } else if (currentScale === 'month') {
    // Start at least 31 days before project start
    const tentativeStartDate = new Date(
      projectStartDate.getTime() - 31 * DAY_MS
    );

    // Set it to the 1st of that month
    calendarStartDate = new Date(
      tentativeStartDate.getFullYear(),
      tentativeStartDate.getMonth(),
      1
    );

    // Set time to beginning of the day
    calendarStartDate.setHours(0, 0, 0, 0);
  } else {
    // 'day' scale or any other default
    calendarStartDate = new Date(projectStartDate.getTime() - 10 * DAY_MS);
    calendarStartDate.setHours(0, 0, 0, 0); // Ensure it's start of the day
  }

  // --- Calculate calendarEndDate ---
  if (currentScale === 'week') {
    // End at least 30 days after project end
    const tentativeEndDate = new Date(projectEndDate.getTime() + 30 * DAY_MS);

    // Find the Sunday closest to or after the tentativeEndDate
    calendarEndDate = new Date(tentativeEndDate);
    const dayOfWeek = calendarEndDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // If it's Sunday, it's already a Sunday. Otherwise, add (7 - dayOfWeek) days to get to the next Sunday.
    if (dayOfWeek !== 0) {
      calendarEndDate.setDate(calendarEndDate.getDate() + (7 - dayOfWeek));
    }

    // Set time to end of the day to ensure consistency (just before midnight)
    calendarEndDate.setHours(23, 59, 59, 999);
  } else if (currentScale === 'month') {
    // End at least 31 days after project end
    const tentativeEndDate = new Date(projectEndDate.getTime() + 31 * DAY_MS);

    // Set it to the last day of that month
    calendarEndDate = new Date(
      tentativeEndDate.getFullYear(),
      tentativeEndDate.getMonth() + 1,
      0
    ); // Day 0 of next month

    // Set time to end of the day
    calendarEndDate.setHours(23, 59, 59, 999);
  } else {
    // 'day' scale or any other default
    calendarEndDate = new Date(projectEndDate.getTime() + 30 * DAY_MS);
    calendarEndDate.setHours(23, 59, 59, 999); // Ensure it's end of the day
  }

  return { calendarStartDate, calendarEndDate };
}