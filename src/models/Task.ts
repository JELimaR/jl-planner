import { SpendingMethod } from '../controllers/ProjectController';
import { IItemData, Item } from './Item';
import type { Process } from './Process';
import { DAY_MS, TDateString, displayStringToDate, formatDateToDisplay } from './dateFunc';

export interface ITaskData extends IItemData {
  type: 'task';
  duration: number;
  actualStartDate?: TDateString;
  calculatedStartDate?: TDateString;
  delay?: number;
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

    // Asegurarse de que la fecha esté dentro del rango del proyecto
    if (date < startDate || date > endDate) {
      return 0;
    }

    const durationInDays = this.duration;

    switch (method) {
      case 'finished':
        // Si la fecha actual es el día de finalización, paga el costo total.
        // De lo contrario, el costo diario es 0.
        if (date.getTime() === endDate.getTime()) {
          return cost;
        }
        return 0;

      case 'started':
        // Si la fecha actual es el día de inicio, paga el costo total.
        // De lo contrario, el costo diario es 0.
        if (date.getTime() === startDate.getTime()) {
          return cost;
        }
        return 0;

      case 'linear':
        // Distribuye el costo total uniformemente a lo largo de la duración.
        return cost / durationInDays;

      default:
        throw new Error('Invalid spending method');
    }
  }

  private _calculatedStartDate?: Date;
  private _actualStartDate?: Date;
  private _delay?: number;
  private _calculatedDuration: number;
  private manualDuration?: number; // Borrar?
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
    this._calculatedDuration = duration;
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
    return this._actualStartDate || this._calculatedStartDate;
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
    return this.manualDuration ?? this._calculatedDuration;
  }

  setDuration(days: number): void {
    this._calculatedDuration = days > 0 ? days : 1;
  }

  /** Establece una duración manual (por ejemplo si se modifica en campo) */
  setManualDuration(days: number): void {
    this.manualDuration = days > 0 ? days : 1;
  }

  /** Establece una fecha real/actual de inicio (por ejemplo si hay un atraso) */
  setActualStartDate(date: Date | undefined): void {
    this._actualStartDate = date;
  }

   /** Establece el retardo real (manual) */
   setActualDelay(D: number): void {
    this._delay = Math.round(D)
    if (this._calculatedStartDate) {
      const actualStartDate = new Date(this._calculatedStartDate.getTime() + DAY_MS * this._delay)
      this.setActualStartDate(actualStartDate)
    }
    throw new Error('Method not implemented.');
  }

  /** Establece la fecha calculada automáticamente por el sistema */
  setCalculatedStartDate(date: Date | undefined): void {
    this._calculatedStartDate = date;
  }

  /** Devuelve la fecha calculada por el sistema */
  getCalculatedStartDate(): Date | undefined {
    return this._calculatedStartDate;
  }

  /** Devuelve la fecha de fin calculada automáticamente */
  getCalculatedEndDate(): Date | undefined {
    if (!this._calculatedStartDate) return undefined;
    const end = new Date(this._calculatedStartDate);
    end.setDate(end.getDate() + this.duration);
    return end;
  }

  /** Devuelve la diferencia entre el inicio real y el calculado */
  getDelayInDays(): number {
    if (!this._actualStartDate || !this._calculatedStartDate) return 0;
    const diff =
      this._actualStartDate.getTime() - this._calculatedStartDate.getTime();
    return Math.ceil(diff / DAY_MS);
  }

  hasActualStartDate(): boolean {
    return !!this._actualStartDate;
  }

  /** Implementación específica para Task */
  get data(): ITaskData {
    return {
      ...super.data,
      type: 'task',
      duration: this.duration,
      manualDuration: this.manualDuration,
      delay: this._delay,
      actualStartDate: this._actualStartDate ? formatDateToDisplay(this._actualStartDate) : undefined,
      calculatedStartDate: this._calculatedStartDate ? formatDateToDisplay(this._calculatedStartDate) : undefined,
    };
  }
}
