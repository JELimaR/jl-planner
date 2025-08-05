// Interfaz base para herencia
export interface IItemData {
  id: number;
  type: 'task' | 'milestone' | 'process';
  name: string;
  detail?: string;
  cost: number;
  processId: number;
  predecessorIds: number[];
}

// Interfaz específica para Task
export interface ITaskData extends IItemData {
  type: 'task';
  duration: number;
  actualStartDate?: string; // ISO format
  calculatedStartDate?: string; // ISO format
  manualDuration?: number;
}

// Interfaz específica para Process
export interface IProcessData extends IItemData {
  type: 'process';
  children: IItemData[];
  useManualCost: boolean;
}

// Interfaz específica para Milestone
export interface IMilestoneData extends IItemData {
  type: 'milestone';
  calculatedDate?: string; // ISO format
  actualStartDate?: string; // ISO format
}

export abstract class Item {
  _id: number;
  _type: 'task' | 'milestone' | 'process';
  _name: string;
  _parent?: Item;
  _detail?: string;
  _color?: string;
  private _cost: number = 0; // Nuevo campo cost
  _isCritical: boolean = false;

  // IDs de los ítems de los que depende este ítem
  predecessors: Set<Item> = new Set();

  constructor(
    id: number,
    type: 'task' | 'milestone' | 'process',
    name: string,
    parent?: Item,
    detail?: string,
    cost: number = 0 // Agregar cost al constructor
  ) {
    this._id = id;
    this._type = type;
    this._name = name;
    this._parent = parent;
    this._detail = detail;
    this._cost = cost;
  }

  setCritial() {
    this._isCritical = true;
  }
  resetCritical() {
    this._isCritical = false;
  }
  get isCritical() {
    return this._isCritical;
  }

  /** */
  abstract get data(): IItemData;

  /** Devuelve la fecha de inicio real (puede ser manual o calculada) */
  abstract getStartDate(): Date | undefined;

  /** Devuelve la fecha de fin real (puede ser manual o calculada) */
  abstract getEndDate(): Date | undefined;

  /** Devuelve la fecha de inicio calculada automáticamente (sin tener en cuenta retrasos manuales) */
  abstract getCalculatedStartDate(): Date | undefined;

  /** Devuelve la fecha de fin calculada automáticamente (sin tener en cuenta retrasos manuales) */
  abstract getCalculatedEndDate(): Date | undefined;

  /** Establece la fecha de inicio calculada automáticamente */
  abstract setCalculatedStartDate(date: Date | undefined): void;

  /** */
  abstract setActualStartDate(date: Date | undefined): void;

  /** */
  abstract hasActualStartDate(): boolean;

  /** */
  abstract getDelayInDays(): number;

  /** */
  addPredecessor(item: Item): void {
    this.predecessors.add(item);
  }

  /** Devuelve la cantidad de días de retraso con respecto a la fecha calculada */
  /*getDelayInDays(): number {
    const start = this.getStartDate();
    const calc = this.getCalculatedStartDate();
    if (!start || !calc) return 0;
    const diffMs = start.getTime() - calc.getTime();
    return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  }*/

  /** Método abstracto para obtener el costo total (implementado diferente en Process) */
  abstract getTotalCost(): number;

  /** Establece el costo del item */
  setCost(cost: number): void {
    this._cost = Math.max(0, cost); // Asegurar que no sea negativo
  }
}
