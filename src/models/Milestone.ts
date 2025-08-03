import { DAY_MS } from '../views/ganttHelpers';
import { Item } from './Item';
import type { Process } from './Process';

export class Milestone extends Item {
  private calculatedDate?: Date;
  private actualStartDate?: Date;
  type: 'milestone' = 'milestone';

  constructor(
    id: number, 
    name: string, 
    parent?: Process, 
    detail?: string,
    cost: number = 0 // Agregar cost al constructor
  ) {
    super(id, 'milestone', name, parent, detail, cost);
  }

  /** Implementación del costo total para Milestone (es su propio costo) */
  getTotalCost(): number {
    return this.cost;
  }

  /** Fecha mostrada (real o planificada) */
  getStartDate(): Date | undefined {
    return this.actualStartDate || this.calculatedDate;
  }

  getEndDate(): Date | undefined {
    return this.getStartDate();
  }

  /** Establece la fecha real (manual) */
  setActualStartDate(date: Date | undefined): void {
    this.actualStartDate = date;
  }

  /** Establece la fecha calculada automáticamente */
  setCalculatedStartDate(date: Date): void {
    this.calculatedDate = date;
  }

  getCalculatedStartDate(): Date | undefined {
    return this.calculatedDate;
  }

  getCalculatedEndDate(): Date | undefined {
    return this.calculatedDate;
  }

  getDelayInDays(): number {
    if (!this.actualStartDate || !this.calculatedDate) return 0;
    const diff = this.actualStartDate.getTime() - this.calculatedDate.getTime();
    return Math.ceil(diff / DAY_MS);
  }

  hasActualStartDate(): boolean {
    return !!this.actualStartDate;
  }
}
