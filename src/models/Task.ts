import { SpendingMethod } from '../controllers/ProjectController';
import { IItemData, Item } from './Item';
import type { Process } from './Process';
import { DAY_MS, TDateString, displayStringToDate, formatDateToDisplay } from './dateFunc';

export interface ITaskData extends IItemData {
  type: 'task';
  duration: number;
  actualStartDate?: TDateString;
  calculatedStartDate?: TDateString;
  manualDuration?: number;
}

export class Task extends Item {
  getDailyCost(date: Date, method: SpendingMethod): number {
    const cost = this.getTotalCost();
    const startDate = this.getStartDate();
    const endDate = this.getEndDate();
    if (!startDate || !endDate) {
      throw new Error('Start date and end date must be defined to calculate daily cost');
    }

    switch (method) {
      case 'finished':
        return endDate && date >= endDate ? 0 : cost;
      case 'started':
        return startDate && date >= startDate ? cost : 0;

      case 'linear':
        if (date >= endDate!) {
          return cost;
        }
        const duration = this.duration;
        const daysProgress = Math.ceil((date.getTime() - startDate.getTime()) / DAY_MS);
        return cost / duration * daysProgress;

      default:
        throw new Error('Invalid spending method');
        break;
    }
  }

  private calculatedStartDate?: Date;
  private actualStartDate?: Date;
  private calculatedDuration: number;
  private manualDuration?: number;
  _type: 'task' = 'task';

  constructor(
    id: number,
    name: string,
    duration: number,
    parent?: Process,
    detail?: string,
    cost: number = 0 // Agregar cost al constructor
  ) {
    super(id, 'task', name, parent, detail, cost);
    this.calculatedDuration = duration;
  }


  edit(data: IItemData): void {
    // Call the parent class's edit method to handle common properties
    super.edit(data);

    // Cast the IItemData to ITaskData to access task-specific properties
    const taskData = data as ITaskData;
    this.setDuration(taskData.duration)

    // Handle task-specific editable properties
    if (taskData.manualDuration !== undefined) {
      this.setManualDuration(taskData.manualDuration);
    } else {
      // If manualDuration is not provided, reset it
      this.manualDuration = undefined;
      // You may also want to update the calculatedDuration if needed,
      // but the current structure suggests it's a fixed property.
    }

    if (!!taskData.actualStartDate) {
      // Assuming a function exists to parse the date string
      // This is a placeholder; you'll need a way to convert TDateString to a Date object.
      this.setActualStartDate(displayStringToDate(taskData.actualStartDate));
    } else {
      this.setActualStartDate(undefined);
    }
  }


  /** Fecha mostrada (actual o planificada) */
  getStartDate(): Date | undefined {
    return this.actualStartDate || this.calculatedStartDate;
  }

  /** Fecha mostrada de fin (calculada a partir de duración y start) */
  getEndDate(): Date | undefined {
    const start = this.getStartDate();
    if (!start) return undefined;
    const end = new Date(start);
    end.setDate(end.getDate() + this.duration);
    return end;
  }

  /** Duración efectiva, prioriza la manual si está definida */
  get duration(): number {
    return this.manualDuration ?? this.calculatedDuration;
  }

  setDuration(days: number): void {
    this.calculatedDuration = days > 0 ? days : 1;
  }

  /** Establece una duración manual (por ejemplo si se modifica en campo) */
  setManualDuration(days: number): void {
    this.manualDuration = days > 0 ? days : 1;
  }

  /** Establece una fecha real/actual de inicio (por ejemplo si hay un atraso) */
  setActualStartDate(date: Date | undefined): void {
    this.actualStartDate = date;
  }

  /** Establece la fecha calculada automáticamente por el sistema */
  setCalculatedStartDate(date: Date | undefined): void {
    this.calculatedStartDate = date;
  }

  /** Devuelve la fecha calculada por el sistema */
  getCalculatedStartDate(): Date | undefined {
    return this.calculatedStartDate;
  }

  /** Devuelve la fecha de fin calculada automáticamente */
  getCalculatedEndDate(): Date | undefined {
    if (!this.calculatedStartDate) return undefined;
    const end = new Date(this.calculatedStartDate);
    end.setDate(end.getDate() + this.duration);
    return end;
  }

  /** Devuelve la diferencia entre el inicio real y el calculado */
  getDelayInDays(): number {
    if (!this.actualStartDate || !this.calculatedStartDate) return 0;
    const diff =
      this.actualStartDate.getTime() - this.calculatedStartDate.getTime();
    return Math.ceil(diff / DAY_MS);
  }

  hasActualStartDate(): boolean {
    return !!this.actualStartDate;
  }

  /** Implementación específica para Task */
  get data(): ITaskData {
    return {
      ...super.data,
      type: 'task',
      duration: this.duration,
      manualDuration: this.manualDuration,

      actualStartDate: this.actualStartDate ? formatDateToDisplay(this.actualStartDate) : undefined,
      calculatedStartDate: this.calculatedStartDate ? formatDateToDisplay(this.calculatedStartDate) : undefined,
    };
  }
}
