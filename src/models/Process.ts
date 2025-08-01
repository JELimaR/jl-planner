import { Item } from './Item';

export class Process extends Item {
  hasActualStartDate(): boolean {
    return false
  }
  getCalculatedStartDate(): Date | undefined {
    throw new Error('Method not implemented.');
  }
  getCalculatedEndDate(): Date | undefined {
    throw new Error('Method not implemented.');
  }
  type: 'process' = 'process';
  private _children: Item[] = [];

  constructor(id: number, name: string, parent?: Process, detail?: string) {
    super(id, 'milestone', name, parent, detail);
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
}
