import { SpendingMethod } from "../controllers/ProjectController";
import { formatDateToDisplay, TDateString } from "./dateFunc";
import { Process } from "./Process";

// Interfaz base para herencia
export interface IItemData {
  id: number;
  type: 'task' | 'milestone' | 'process';
  name: string;
  detail?: string;
  startDate: TDateString;
  endDate: TDateString;
  cost: number;
  parentId: number;
  predecessorIds: number[];
  isCritical: boolean;
  color?: string;
}

export abstract class Item {
  private _id: number;
  _type: 'task' | 'milestone' | 'process';
  private _name: string;
  private _parent?: Item;
  private _detail?: string;
  _color?: string;
  private _cost: number = 0; // Nuevo campo cost
  private _isCritical: boolean = false;

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

  setCritical() {
    this._isCritical = true;
  }
  resetCritical() {
    this._isCritical = false;
  }
  get isCritical() {
    return this._isCritical;
  }

  get id(): number {
    return this._id
  }
  get name(): string {
    return this._name
  }
  get detail(): string {
    return this._detail || ''
  }
  get parent(): Item | undefined {
    return this._parent
  }
  set parent(p: Process) {
    this._parent = p
  }

  edit(data: IItemData) {
    // We explicitly prevent the modification of id, type, and parent.
    // The provided 'data' is used only for other properties.
    this._name = data.name;
    this._detail = data.detail;
    this._cost = data.cost;

    // This method doesn't handle predecessor updates because that logic
    // is usually managed by a controller that has access to all items
    // to ensure relations are properly set up.
  }
  /**
   * ⚠️ DANGER: FORCIBLY SETS THE ITEM'S ID.
   * * This method should be used with extreme caution. Changing an item's ID
   * can break critical relationships and dependencies throughout the project
   * structure (e.g., predecessor links, parent-child references). It is
   * intended for internal use cases like ID normalization and should not
   * be called during regular item editing.
   * * @param newId The new ID to assign to the item.
   */
  public forceSetId(newId: number): void {
    // Log a strong warning to the console.
    /*console.warn(
      `⚠️ DANGER: Forcibly changing item ID from ${this._id} to ${newId}. ` +
      `Ensure all project references and relationships are updated accordingly.`
    );*/
    this._id = newId;
  }


  /** */
  get data(): IItemData {
    const startDate = formatDateToDisplay(this.getStartDate() || new Date());
    if (!startDate) throw new Error('Start date cannot be undefined');

    const endDate = formatDateToDisplay(this.getEndDate() || new Date());
    if (!endDate) throw new Error('End date cannot be undefined');

    return {
      id: this.id,
      type: this._type,
      name: this.name,
      detail: this.detail,
      startDate: startDate,
      endDate: endDate,
      isCritical: this.isCritical,
      color: this._color,
      cost: this.getTotalCost(),
      parentId: this._parent?._id ?? -1,
      predecessorIds: Array.from(this.predecessors).map((item) => item._id),
    }
  }

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
  getTotalCost(): number {
    return this._cost;
  }

  abstract getDailyCost(date: Date, method: SpendingMethod): number;

  /** Establece el costo del item */
  setCost(cost: number): void {
    this._cost = Math.max(0, cost); // Asegurar que no sea negativo
  }
}
