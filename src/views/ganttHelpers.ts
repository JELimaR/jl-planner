import type { Item } from '../models/Item';

export const DAY_MS = 24 * 60 * 60 * 1000;

export type Scale = 'day' | 'week' | 'month';
export const itemPositionLeft: Map<number, { x: number; y: number }> =
  new Map();
export const itemPositionRight: Map<number, { x: number; y: number }> =
  new Map();

export const SCALE_OPTIONS = {
  day: { label: 'Día', pxPerDay: 32 },
  week: { label: 'Semana', pxPerDay: 9 },
  month: { label: 'Mes', pxPerDay: 3 },
} as const;

// Calcula cuántas unidades de tiempo hay entre dos fechas según la escala
export function getTimeUnitsBetween(
  start: Date,
  end: Date,
  scale: Scale
): number {
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

export function getXPositionStart(
  item: Item,
  calendarStartDate: Date,
  scale: Scale
): number {
  return (
    getTimeUnitsBetween(calendarStartDate, item.getStartDate()!, 'day') *
    SCALE_OPTIONS[scale].pxPerDay
  );
}

export function getXPositionEnd(
  item: Item,
  calendarStartDate: Date,
  scale: Scale
): number {
  return (
    getTimeUnitsBetween(calendarStartDate, item.getEndDate()!, 'day') *
    SCALE_OPTIONS[scale].pxPerDay
  );
}
