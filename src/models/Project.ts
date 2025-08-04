import { DAY_MS } from '../views/ganttHelpers';
import { DependencyGraph } from './DependencyGraph';
import {
  calculateDatesFromGraph,
  getCriticalPathsFromGraph,
  type CriticalPath,
} from './graphCalculation';
import type { Item } from './Item';
import { Milestone } from './Milestone';
import { Process } from './Process';
import { Task } from './Task';

export interface IProjectData {
  id: string;
  title: string;
  subTitle: string;

}

export class Project {
  private id: string;
  private rootProcess: Process;
  private projectStartDate: Date;
  private startMilestone: Milestone;
  private endMilestone: Milestone;
  private allItemsMap: Map<number, Item> = new Map();

  constructor(id: string, startDate: Date) {
    this.id = id;

    this.projectStartDate = startDate;

    // Crear el proceso raíz
    this.rootProcess = new Process(1001, 'Project Root Process');
    this.allItemsMap.set(this.rootProcess.id, this.rootProcess);

    // Crear el hito de inicio
    this.startMilestone = new Milestone(1000, 'start', this.rootProcess);
    this.startMilestone.setCalculatedStartDate(startDate);
    this.allItemsMap.set(this.startMilestone.id, this.startMilestone);
    this.rootProcess.addChild(this.startMilestone);

    // Crear el hito final
    this.endMilestone = new Milestone(1002, 'end', this.rootProcess);
    this.endMilestone.setCalculatedStartDate(startDate);
    this.rootProcess.addChild(this.endMilestone);
    this.allItemsMap.set(this.endMilestone.id, this.endMilestone);
  }

  title: string = 'Proyecto sin título';
  subtitle: string = '';

  getId(): string {
    return this.id;
  }

  setTitle(title: string) {
    this.title = title;
  }

  setSubtitle(subtitle: string) {
    this.subtitle = subtitle;
  }

  getTitle(): string {
    return this.title;
  }

  getSubtitle(): string {
    return this.subtitle;
  }

  /**
   * Agrega un nuevo item al proyecto. Si el item contiene hijos (como un Process), Se eliminan!!.
   * Si el item no tiene dependencias, se le asigna automáticamente el hito de inicio como dependencia.
   * Se agrega el item a las dependencias de endMilestone
   */
  addItem(item: Item, parent?: Process): void {
    if (this.allItemsMap.has(item.id)) {
      console.error(`Ya existe el item: ID ${item.id}`);
    } else {
      this.allItemsMap.set(item.id, item);
    }
    if (parent && parent.id !== this.rootProcess.id) {
      parent.addChild(item);
      parent.predecessors.forEach((dep: Item) => {
        this.addRelation(dep, item);
      });
      item.parent = parent;
    } else {
      if (item.predecessors.size === 0) {
        this.addRelation(this.startMilestone, item);
      }
      item.parent = this.rootProcess;
      // Quitar el hito final para insertar el nuevo item antes que él
      this.rootProcess.removeChild(this.endMilestone.id);
      this.rootProcess.addChild(item);
      this.rootProcess.addChild(this.endMilestone);
      this.addRelation(item, this.endMilestone);
    }

    this.calculateItemDates();
  }

  updateRelations() {
    this.rootProcess.children.forEach((item: Item) => {
      item.predecessors.forEach((prede: Item) => {
        this.addRelation(prede, item);
      });
    });
  }

  addRelation(pre: Item, suc: Item) {
    if (pre.id == suc.id) {
      return;
    }
    if (pre instanceof Process) {
      pre.children.forEach((preChild: Item) => {
        this.addRelation(preChild, suc);
      });
    }
    if (suc instanceof Process) {
      if (suc.children.includes(pre)) {
        return;
      }
      suc.children.forEach((sucChild: Item) => {
        this.addRelation(pre, sucChild);
      });
    }
    suc.addPredecessor(pre);
  }

  getAllItems() {
    return this.allItemsMap;
  }

  getProjectStartDate(): Date {
    return this.startMilestone.getStartDate()!;
  }
  changeStartDate(newDate: Date) {
    this.projectStartDate = newDate;
    this.startMilestone.setCalculatedStartDate(newDate);
  }

  getProjectEndDate(): Date {
    this.calculateItemDates();
    return this.endMilestone.getStartDate()!;
  }

  getItemById(id: number): Item | undefined {
    return this.allItemsMap.get(id);
  }

  /**
   * Calcula, de forma automatica, las fechas de inicio y fin de cada Item
   * Si un Item, tiene alguna fecha (o duration en caso de un Task), utiliza esa fecha en vez de la calculada automaticamente
   */
  calculateItemDates(): void {
    this.updateRelations();
    // Paso 1: construir grafo de dependencias con solo tareas e hitos
    const graph = DependencyGraph.fromProject(this);

    // Paso 2: calcular fechas para el grafo plano
    calculateDatesFromGraph(graph, this.projectStartDate);

    // Paso 3: recursivamente actualizar fechas de procesos
  }

  /************************************************************************************** */
  /**
   * Devuelve todos los caminos críticos del proyecto.
   * Un camino crítico es una secuencia de Items desde el hito de inicio hasta el hito de fin
   * donde no hay holgura (es decir, cada item comienza inmediatamente después de que termina
   * su predecesor en el camino, sin días de espera).
   *
   * Para que este método funcione correctamente, calculateItemDates() debe haberse ejecutado
   * previamente para asegurar que todas las fechas calculadas son precisas.
   *
   * @returns Un array de caminos críticos, donde cada camino es un array de Items.
   */
  getCriticalPaths(): CriticalPath[] {
    this.allItemsMap.forEach((item) => item.resetCritical());
    // Paso 1: construir grafo de dependencias con solo tareas e hitos
    const graph = DependencyGraph.fromProject(this);

    const out = getCriticalPathsFromGraph(
      graph,
      this.startMilestone.id,
      this.endMilestone.id
    );

    out.forEach((criticalPath: CriticalPath) => {
      criticalPath.path.forEach((item) => {
        item.setCritial();
      });
    });

    return out;
  }

  getStartMilestone(): Milestone {
    return this.startMilestone;
  }

  getEndMilestone(): Milestone {
    return this.endMilestone;
  }

  getRoot(): Process {
    return this.rootProcess;
  }

  /************************************************************************** */
  /**
   * Retorna todos los ítems (Task o Milestone) cuyo inicio real es posterior al calculado.
   */

  getDelayedItems(): Array<Task | Milestone> {
    const delayed: Array<Task | Milestone> = [];

    for (const item of this.allItemsMap.values()) {
      if (item instanceof Task || item instanceof Milestone) {
        const calc = item.getCalculatedStartDate();
        const actual = item.getStartDate();
        if (calc && actual && actual > calc) {
          delayed.push(item);
        }
      }
    }

    return delayed;
  }

  /**
   * Calcula el atraso total del proyecto en días.
   * Se basa en la diferencia entre la fecha fin calculada y la mayor fecha fin real (entre todos los ítems).
   * Si no hay atrasos, devuelve 0.
   */

  getTotalProjectDelayInDays(): number {
    const projectEnd = this.getProjectEndDate();
    if (!projectEnd) return 0;

    let maxActualEnd: Date | undefined = undefined;

    for (const item of this.allItemsMap.values()) {
      if (item instanceof Task || item instanceof Milestone) {
        const actualEnd = item.getEndDate();

        if (actualEnd && (!maxActualEnd || actualEnd > maxActualEnd)) {
          maxActualEnd = actualEnd;
        }
      }
    }

    if (!maxActualEnd || maxActualEnd <= projectEnd) return 0;

    const delayMs = maxActualEnd.getTime() - projectEnd.getTime();
    return Math.ceil(delayMs / DAY_MS);
  }

  /** */
  traverse(
    callback: (item: Item, depth: number, parent: Process) => void
  ): void {
    const visit = (item: Item, depth: number, parent: Process) => {
      callback(item, depth, parent);

      if (item instanceof Process) {
        for (const child of item.children) {
          visit(child, depth + 1, item);
        }
      }
    };

    for (const child of this.getRoot().children) {
      visit(child, 0, this.getRoot());
    }
  }

  /**
   * 
   */
  getData(): IProjectData {
    return {
      id: this.id,
      title: this.getTitle(),
      subTitle: this.getSubtitle()
    }
  }

}