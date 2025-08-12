import type { IItemData } from '../../src/models/Item';
import { DAY_MS, displayStringToDate } from '../../src/models/dateFunc';

export type Scale = 'day' | 'week' | 'month';
interface IPosition { x: number; y: number }
export const itemPositionLeft: Map<number, IPosition> = new Map();
export const itemPositionRight: Map<number, IPosition> = new Map();

export const SCALE_OPTIONS = {
  day: { label: 'Día', pxPerDay: 32 },
  week: { label: 'Semana', pxPerDay: 9 },
  month: { label: 'Mes', pxPerDay: 3 },
} as const;

// Calcula cuántas unidades de tiempo hay entre dos fechas según la escala
export function getTimeUnitsBetween(start: Date, end: Date, scale: Scale): number {
  const msDiff = end.getTime() - start.getTime();

  if (scale === 'day') return Math.ceil(msDiff / DAY_MS);
  if (scale === 'week') return Math.ceil(msDiff / (7 * DAY_MS));
  if (scale === 'month') {
    return (
      end.getMonth() -
      start.getMonth() +
      12 * (end.getFullYear() - start.getFullYear()) +
      1
    );
  }

  return 0;
}

export function getXPositionStart(item: IItemData, calendarStartDate: Date, scale: Scale): number {
  return (
    getTimeUnitsBetween(calendarStartDate, displayStringToDate(item.startDate), 'day') *
    SCALE_OPTIONS[scale].pxPerDay
  );
}

export function getXPositionEnd(item: IItemData, calendarStartDate: Date, scale: Scale): number {
  return (
    getTimeUnitsBetween(calendarStartDate, displayStringToDate(item.endDate), 'day') *
    SCALE_OPTIONS[scale].pxPerDay
  );
}