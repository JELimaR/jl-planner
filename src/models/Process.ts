import { SpendingMethod } from '../controllers/ProjectController';
import { DAY_MS } from '../views/ganttHelpers';
import { type IItemData, Item } from './Item';

export interface IProcessData extends IItemData {
  type: 'process';
  children: IItemData[];
  useManualCost: boolean;
}

export class Process extends Item {
  getDailyCost(date: Date, method: SpendingMethod): number {
    let out = 0;
    if (this._useManualCost) {
      out = this.getDailyCostLikeTask(date, method);
    } else {
      this._children.forEach(child => {
        out += child.getDailyCost(date, method);
      })
    }
    return out;

  }

    private getDailyCostLikeTask(date: Date, method: SpendingMethod): number {
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
        const duration = (endDate!.getTime() - startDate!.getTime())/DAY_MS;
        const daysProgress = Math.ceil((date.getTime() - startDate.getTime()) / DAY_MS);
        return cost / duration * daysProgress;

      default:
        throw new Error('Invalid spending method');
        break;
    }
  }


  hasActualStartDate(): boolean {
    return false
  }
  getCalculatedStartDate(): Date | undefined {
    throw new Error('Method not implemented.');
  }
  getCalculatedEndDate(): Date | undefined {
    throw new Error('Method not implemented.');
  }

  private _children: Item[] = [];
  private _useManualCost: boolean = false; // Nuevo campo para indicar si usar costo manual
  _type: 'process' = 'process';

  constructor(
    id: number, 
    name: string, 
    parent?: Process, 
    detail?: string,
    cost: number = 0,
    useManualCost: boolean = false // Agregar parámetro para usar costo manual
  ) {
    super(id, 'process', name, parent, detail, cost);
    this._useManualCost = useManualCost;
  }

  edit(data: IItemData): void {
    // Call the parent class's edit method to handle common properties
    super.edit(data);

    // Cast the IItemData to IProcessData to access process-specific properties
    const processData = data as IProcessData;

    // Handle process-specific editable properties
    if (processData.useManualCost !== undefined) {
      this.setUseManualCost(processData.useManualCost);
    }

    // The children property is handled by other methods (addChild, removeChild),
    // not directly through the edit method, as it represents the project's structure.
  }

  /** Establece si debe usar el costo manual o calculado */
  setUseManualCost(useManual: boolean): void {
    this._useManualCost = useManual;
  }

  /** Obtiene si está usando costo manual */
  getUseManualCost(): boolean {
    return this._useManualCost;
  }

  /** Calcula el costo sumando los costos de los hijos */
  private calculateChildrenCost(): number {
    try {
      return this._children.reduce((total, child) => {
        return total + child.getTotalCost();
      }, 0);
    } catch (error) {
      console.error('Error calculating children cost for process:', this.name, error);
      return 0;
    }
  }

  /** Implementación del costo total para Process (manual o calculado según configuración) */
  getTotalCost(): number {
    try {
      if (this._useManualCost) {
        return super.getTotalCost(); // Usar costo manual
      } else {
        return this.calculateChildrenCost(); // Usar costo calculado (suma de hijos)
      }
    } catch (error) {
      console.error('Error getting total cost for process:', this.name, error);
      return 0;
    }
  }

  get children(): Item[] {
    return this._children;
  }

  /**
   * Devuelve todos los ítems terminales (no procesos) en forma plana.
   * Se usa, por ejemplo, para construir grafos de dependencias.
   */
  getTerminalItems(): Item[] {
    const leaves: Item[] = [];

    const visit = (node: Item) => {
      if (node instanceof Process) {
        for (const child of node.children) visit(child);
      } else {
        leaves.push(node);
      }
    };

    visit(this);
    return leaves;
  }

  addPredecessor(prede: Item): void {
    if (!this.children.includes(prede)) {
      super.addPredecessor(prede);
      this._children.forEach((child: Item) => {
        child.addPredecessor(prede);
      });
    }
  }

  /**
   * Devuelve la fecha más temprana de inicio entre sus hijos.
   */
  getStartDate(): Date | undefined {
    if (this._children.length === 0) return undefined;
    const startDates = this._children
      .map((child) => child.getStartDate())
      .filter((d): d is Date => !!d);
    return startDates.length
      ? new Date(Math.min(...startDates.map((d) => d.getTime())))
      : undefined;
  }

  /**
   * Devuelve la fecha más tardía de fin entre sus hijos.
   */
  getEndDate(): Date | undefined {
    if (this._children.length === 0) return undefined;
    const endDates = this._children
      .map((child) => child.getEndDate())
      .filter((d): d is Date => !!d);
    return endDates.length
      ? new Date(Math.max(...endDates.map((d) => d.getTime())))
      : undefined;
  }

  /**
   * Agrega un hijo al proceso. Hereda los predecesores del proceso al hijo.
   */
  addChild(item: Item): void {
    this._children.push(item);
    this.predecessors.forEach((p) => item.addPredecessor(p));
    item.parent = this;
  }

  /**
   * Elimina un hijo por ID. Retorna `true` si fue eliminado.
   */
  removeChild(id: number): boolean {
    const initialLength = this._children.length;
    this._children = this._children.filter((child) => child.id !== id);
    return this._children.length < initialLength;
  }

  /**
   * Los procesos no permiten modificar su fecha directamente.
   * Representan agregaciones calculadas.
   */
  setActualStartDate(_: Date | undefined): void {
    console.log(this);
    throw new Error('No se puede asignar una fecha manual a un proceso.');
  }

  setCalculatedStartDate(_: Date | undefined): void {
    console.log(this);
    throw new Error(
      'No se puede asignar una fecha calculada directa a un proceso.'
    );
  }

  getDelayInDays(): number {
    return 0; // Procesos no tienen delay directo, es derivado de sus hijos.
  }

  /** Implementación específica para Process */
  get data(): IProcessData {
    return {
      ...super.data,
      type: 'process',
      cost: this.getTotalCost(),
      children: this._children.map(child => child.data),
      useManualCost: this._useManualCost
    };
  }
}
