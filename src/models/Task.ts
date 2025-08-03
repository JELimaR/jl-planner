import { Item } from './Item';
import type { Process } from './Process';

const ONEDAY = 24 * 60 * 60 * 1000;

export class Task extends Item {
  private calculatedStartDate?: Date;
  private actualStartDate?: Date;
  private calculatedDuration: number;
  private manualDuration?: number;
  type: 'task' = 'task';

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

  /** Implementación del costo total para Task (es su propio costo) */
  getTotalCost(): number {
    return this.cost;
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
    return Math.ceil(diff / ONEDAY);
  }

  hasActualStartDate(): boolean {
    return !!this.actualStartDate;
  }
}
