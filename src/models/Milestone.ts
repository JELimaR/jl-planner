import { SpendingMethod } from '../controllers/ProjectController';
import { DAY_MS } from './dateFunc';
import { IItemData, Item } from './Item';
import type { Process } from './Process';
import { TDateString, displayStringToDate, formatDateToDisplay } from './dateFunc';

export interface IMilestoneData extends IItemData {
  type: 'milestone';
  calculatedStartDate?: TDateString;
  actualStartDate?: TDateString;
}

export class Milestone extends Item {
  getDailyCost(date: Date, method: SpendingMethod): number {
    const cost = this.getTotalCost();
    const startDate = this.getStartDate();
    const endDate = this.getEndDate();
    if (!startDate || !endDate) {
      throw new Error('Start date and end date must be defined to calculate daily cost');
    }

    if (date >= startDate) {
      return this.getTotalCost();
    } else {
      return 0;
    }
  }
  private _calculatedStartDate?: Date;
  private _actualStartDate?: Date;
  _type: 'milestone' = 'milestone';

  constructor(
    id: number, 
    name: string, 
    parent?: Process, 
    detail?: string,
    cost: number = 0 // Agregar cost al constructor
  ) {
    super(id, 'milestone', name, parent, detail, cost);
  }

  edit(data: IItemData): void {
    // Call the parent class's edit method to handle common properties
    super.edit(data);

    // Cast the IItemData to IMilestoneData to access milestone-specific properties
    const milestoneData = data as IMilestoneData;

    // Handle milestone-specific editable properties
    if (!!milestoneData.actualStartDate) {
      // Assuming a function exists to parse the date string
      this.setActualStartDate(displayStringToDate(milestoneData.actualStartDate));
    } else {
      this.setActualStartDate(undefined);
    }
  }

  /** Fecha mostrada (real o planificada) */
  getStartDate(): Date | undefined {
    return this._actualStartDate || this._calculatedStartDate;
  }

  getEndDate(): Date | undefined {
    return this.getStartDate();
  }

  /** Establece la fecha real (manual) */
  setActualStartDate(date: Date | undefined): void {
    this._actualStartDate = date;
  }

  /** Establece la fecha calculada automáticamente */
  setCalculatedStartDate(date: Date): void {
    this._calculatedStartDate = date;
  }

  getCalculatedStartDate(): Date | undefined {
    return this._calculatedStartDate;
  }

  getCalculatedEndDate(): Date | undefined {
    return this._calculatedStartDate;
  }

  getDelayInDays(): number {
    if (!this._actualStartDate || !this._calculatedStartDate) return 0;
    const diff = this._actualStartDate.getTime() - this._calculatedStartDate.getTime();
    return Math.ceil(diff / DAY_MS);
  }

  hasActualStartDate(): boolean {
    return !!this._actualStartDate;
  }

  /** Implementación específica para Milestone */
  get data(): IMilestoneData {
    return {
      ...super.data,
      type: 'milestone',
      actualStartDate: this._actualStartDate ? formatDateToDisplay(this._actualStartDate) : undefined,
      calculatedStartDate: this._calculatedStartDate ? formatDateToDisplay(this._calculatedStartDate) : undefined,
    };
  }
}
