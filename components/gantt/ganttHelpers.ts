import type { IItemData } from '../../src/models/Item';
import { IMilestoneData } from '../../src/models/Milestone';
import { IProjectData } from '../../src/models/Project';
import { ITaskData } from '../../src/models/Task';
import { DAY_MS, displayStringToDate } from '../../src/models/dateFunc';

export type Scale = 'day' | 'week' | 'month';
interface IPosition { x: number; y: number }
export const itemPositionLeft: Map<number, IPosition> = new Map();
export const itemPositionRight: Map<number, IPosition> = new Map();

export const SCALE_OPTIONS = {
  day: { label: 'Día', pxPerDay: 32 },
  week: { label: 'Semana', pxPerDay: 9 },
  month: { label: 'Mes', pxPerDay: 2 },
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

/**
 * Calculates the delay in days for an item.
 *
 * @param item The IItemData object (task, milestone, or process).
 * @returns The delay in days, or 0 if no delay or if the item is a process.
 */
export function getDelayInDays(item: IItemData): number {
  if (item.type === 'process') {
    return 0;
  }

  const actualStartDate = (item as ITaskData | IMilestoneData).actualStartDate
    ? displayStringToDate((item as ITaskData | IMilestoneData).actualStartDate!)
    : null;
  const calculatedStartDate = (item as ITaskData | IMilestoneData).calculatedStartDate
    ? displayStringToDate((item as ITaskData | IMilestoneData).calculatedStartDate!)
    : null;

  if (actualStartDate && calculatedStartDate) {
    const diffInMs = actualStartDate.getTime() - calculatedStartDate.getTime();
    return Math.ceil(diffInMs / DAY_MS);
  }

  return 0;
}

/**
 * Determina si un ítem es parte de la ruta crítica del proyecto.
 * @param projectData El objeto de datos del proyecto completo.
 * @param item El ítem a verificar.
 * @returns `true` si el ítem es parte de la ruta crítica, de lo contrario `false`.
 */
export function isCritical(projectData: IProjectData, item: IItemData, criticalPathIndex: number | undefined): boolean {
  const criticalPaths = projectData.criticalPaths;
  
  if (!criticalPaths || criticalPaths.length === 0) {
    return false;
  }

  //
  if (criticalPathIndex == undefined) {
    return false
  }
  
  // If no specific path is selected, check if item is in any critical path
  if (criticalPathIndex == -1) {
    for (const path of criticalPaths) {
      if (path.path.some(criticalItem => criticalItem.id === item.id)) {
        return true;
      }
    }
    return false;
  }
  // If a specific path is selected, check only that path
  if (criticalPathIndex >= 0 && criticalPathIndex < criticalPaths.length) {
    const selectedPath = criticalPaths[criticalPathIndex];
    return selectedPath.path.some(criticalItem => criticalItem.id === item.id);
  }
  
  return false;
}

export function isCriticalArrow(projectData: IProjectData, pred: IItemData, succ: IItemData, criticalPathIndex: number | undefined) {
  const criticalPaths = projectData.criticalPaths;
  
  if (!criticalPaths || criticalPaths.length === 0) {
    return false;
  }

   //
  if (criticalPathIndex == undefined) {
    return false
  }
  
  // If no specific path is selected, check if arrow is in any critical path
  if (criticalPathIndex == -1) {
    let out = false;
    criticalPaths.forEach((path) => {
      for (let i = 1; i < path.path.length && !out; i++) {
        out = path.path[i - 1].id == pred.id && path.path[i].id == succ.id;
      }
    });
    return out;
  }
  
  // If a specific path is selected, check only that path
  if (criticalPathIndex >= 0 && criticalPathIndex < criticalPaths.length) {
    const selectedPath = criticalPaths[criticalPathIndex];
    for (let i = 1; i < selectedPath.path.length; i++) {
      if (selectedPath.path[i - 1].id == pred.id && selectedPath.path[i].id == succ.id) {
        return true;
      }
    }
  }
  
  return false;
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
    calendarEndDate.setHours(23, 0, 0, 0);
  } else {
    // 'day' scale or any other default
    calendarEndDate = new Date(projectEndDate.getTime() + 10 * DAY_MS);
    calendarEndDate.setHours(23, 0, 0, 0); // Ensure it's end of the day
  }

  return { calendarStartDate, calendarEndDate };
}