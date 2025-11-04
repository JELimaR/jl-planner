import { DAY_MS, displayStringToDate, formatDateToDisplay, type TDateString } from './dateFunc';
import { DependencyGraph } from './DependencyGraph';
import { calculateDatesFromGraph, getCriticalPathsFromGraph, type ICriticalPathData, type CriticalPath, } from './graphCalculation';
import type { IItemData, Item } from './Item';
import { Milestone } from './Milestone';
import { type IProcessData, Process } from './Process';
import { Task } from './Task';
import { itemDataToItem } from '../controllers/dataHelpers';

export interface IProjectHeader {
  id: string; // Será el _id de MongoDB o "new"/"loaded" para temporales
  title: string;
  subtitle: string;
  startDate: TDateString;
  endDate: TDateString;
}

export interface IProjectData extends IProjectHeader {
  items: IItemData[];
  criticalPaths: ICriticalPathData[];
  // Campos de base de datos integrados
  _id?: string; // MongoDB ObjectId como string
  ownerId?: string;
  isPublic?: boolean;
  isTemplate?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Alias para compatibilidad (ahora IProjectData incluye todo)
export interface IProjectDataDB extends IProjectData {}

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
    if (!!this.allItemsMap.has(item.id)) {
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
    if (pre.id == suc.id || pre.parent?.id == suc.id || suc.parent?.id == pre.id) {
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

    const graph = DependencyGraph.fromProject(this);
    try {
      // Intentar agregar la relación en el grafo de validación.
      graph.addEdge(pre.id, suc.id);

      // Si no se lanza un error, la relación es válida.
      suc.addPredecessor(pre);
    } catch (error) {
      // Capturar el error y re-lanzarlo para indicar que la operación falló.
      throw new Error(`Failed to add relation ${pre.id} -> ${suc.id}: ${(error as any).message}`); // corregir
    }
  }

  /**
   * Modifies an existing item's data.
   * The item's ID, type, and parent process cannot be changed.
   *
   * @param itemData The data object containing the updated values.
   */
  editItem(itemData: IItemData): void {
    // Find the existing item by ID
    const existingItem = this.getItemById(itemData.id);

    // If the item doesn't exist, throw an error
    if (!existingItem) {
      throw new Error(`Item with ID ${itemData.id} not found.`);
    }

    // Ensure the type and parent ID have not been changed
    if (existingItem._type !== itemData.type) {
      throw new Error('Cannot change the type of an item.');
    }

    if (existingItem.parent?.id !== itemData.parentId) {
      throw new Error('Cannot change the parent process of an item.');
    }

    // Update the item's properties using its own edit method
    existingItem.edit(itemData);

    // Clear and re-add predecessor relationships
    existingItem.predecessors.clear();
    itemData.predecessorIds.forEach((predId) => {
      const predecessor = this.getItemById(predId);
      if (predecessor) {
        this.addRelation(predecessor, existingItem);
      }
    });

    // Recalculate project dates to reflect the changes
    this.calculateItemDates();
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
        item.setCritical();
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

    this.allItemsMap.forEach((item) => {
      if (item instanceof Task || item instanceof Milestone) {
        const calc = item.getCalculatedStartDate();
        const actual = item.getStartDate();
        if (calc && actual && actual > calc) {
          delayed.push(item);
        }
      }
    })

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

  /**
   * Recorre el proyecto de forma recursiva, llamando a la función callback para cada ítem.
   * @param callback Función a llamar para cada ítem. Recibe el ítem, su profundidad en el árbol y su proceso padre.
   */
  traverse(
    callback: (item: Item, depth: number, parent: Process) => void
  ): void {
    const visit = (item: Item, depth: number, parent: Process) => {
      callback(item, depth, parent);

      if (item instanceof Process) {
        item.children.forEach((child: Item) => {
          visit(child, depth + 1, item);
        })
      }
    };

    this.getRoot().children.forEach((child: Item) => {
      visit(child, 0, this.getRoot());
    })
  }

  /**
   * 
   */
  getData(): IProjectData {
    const items: IItemData[] = [];
    this.getRoot().children.forEach((child: Item) => {
      items.push(child.data);
    })

    return {
      ...this.getHeaderData(),
      items,
      criticalPaths: this.getCriticalPaths().map(cp => {
        return {
          path: cp.path.map(i => i.data),
          totalDelayDays: cp.totalDelayDays
        }
      })
    };
  }

  getHeaderData(): IProjectHeader {
    const startDate = formatDateToDisplay(this.getProjectStartDate());
    const endDate = formatDateToDisplay(this.getProjectEndDate());
    if (!startDate || !endDate) {
      throw new Error(`Project start date is not set.`);
    }

    return {
      id: this.getId(),
      title: this.getTitle(),
      subtitle: this.getSubtitle(),
      startDate,
      endDate,
    };
  }

  /**
   * Crea una copia profunda del proyecto actual.
   * La copia es una nueva instancia de la clase Project y todos sus ítems
   * son nuevos objetos, no referencias.
   *
   * @returns Una nueva instancia de Project que es una copia idéntica del original.
   */
  copy(): Project {
    // Paso 1: Obtener los datos serializados del proyecto actual.
    const projectData = this.getData();

    // Paso 2: Usar el método estático de deserialización
    // para crear una nueva instancia de Project a partir de esos datos.
    const newProject = Project.deserializeProject(projectData);

    return newProject;
  }

  static deserializeProject(data: IProjectData): Project {
    const project = new Project(data.id, displayStringToDate(data.startDate));
    project.setTitle(data.title);
    project.setSubtitle(data.subtitle);
    data.items.forEach((iid: IItemData) => {
      if (!(iid.id == project.getEndMilestone().id || iid.id == project.getStartMilestone().id)) {
        serial2Item(project, iid, project.getRoot());
      }
    });

    restoreRelationsRecursively(project, data.items);

    return project;
  }
}

function serial2Item(project: Project, data: IItemData, parent: Process): void {
  if (data.parentId !== parent.id) {
    console.log(data)
    console.log(project)
    throw new Error(`data parent: ${data.parentId} - praent.id: ${parent.id}`);
  }
  let item: Item = itemDataToItem(data.id, data, project);
  project.addItem(item, parent);

  if (data.type == 'process') {
    (data as IProcessData).children.forEach((child: IItemData) => {
      serial2Item(project, child, item as Process);
    });
  }
}

function restoreRelationsRecursively(project: Project, itemDataArr: IItemData[]) {
  for (const idata of itemDataArr) {
    const item = project.getItemById(idata.id);
    if (!item) {
      throw new Error(`Item no encontrado: ${idata.id}`);
    }

    // Asignar predecesores
    for (const pid of idata.predecessorIds) {
      const prede = project.getItemById(pid);
      if (!prede) {
        throw new Error(`Predecesor no encontrado: ${pid}`);
      }
      project.addRelation(prede, item);
    }

    // Si es un proceso, aplicar recursivamente a los hijos
    if (item instanceof Process) {
      const pdata = idata as IProcessData
      restoreRelationsRecursively(project, pdata.children);
    }
  }
}
