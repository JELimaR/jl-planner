import { displayStringToDate, formatDateToDisplay, TDateString } from '../models/dateFunc';
import { CriticalPath, ICriticalPathData } from '../models/graphCalculation';
import type { Item, IItemData } from '../models/Item';
import { IMilestoneData } from '../models/Milestone';
import { IProcessData, Process } from '../models/Process';
import { IProjectData, IProjectHeader, Project } from '../models/Project';
import { ITaskData } from '../models/Task';
import { setProjectItemsColors } from '../views/colors';
import { itemDataToItem } from './dataHelpers';
import { getAllTemplateProjectHeaders, getTemplateProject, TTemplateID } from '../templates/templateProjects';


// ver donde va
export type SpendingMethod = 'finished' | 'started' | 'linear';

export class ProjectController {
  private static instance: ProjectController;
  private project: Project;

  private constructor(startDate: Date) {
    this.createNewProject(startDate);
  }

  static getInstance(startDate?: Date): ProjectController {
    if (!this.instance) {
      startDate = startDate || new Date();
      this.instance = new ProjectController(startDate);
    }
    return this.instance;
  }

  createNewProject(startDate: Date): void {
    const id: string = 'new';
    this.project = new Project(id, startDate);
  }

  getProject(): Project { // borrar
    setProjectItemsColors(this.project)
    this.project.calculateItemDates()
    return this.project;
  }

  getProjectData(): IProjectData {
    setProjectItemsColors(this.project)
    this.project.calculateItemDates()
    return this.project.getData();
  }

  getHeaderData(): IProjectHeader {
    return this.project.getHeaderData();
  }

  getCriticalPahh(): ICriticalPathData[] {
    const out: ICriticalPathData[] = []
    this.project.getCriticalPaths().forEach((value: CriticalPath) => {
      out.push({
        path: value.path.map(i => i.data),
        totalDelayDays: value.totalDelayDays
      })
    })
    return out
  }

  getAllItems(): Item[] { // borrar
    const out: Item[] = [this.project.getRoot()];
    this.project.traverse((item: Item, _: number, __: Process) => {
      out.push(item);
    })
    return out
  }

  getAllProcess(): IProcessData[] {
    const out: IProcessData[] = []
    this.project.getAllItems().forEach(item => {
      if (item instanceof Process) {
        out.push(item.data)
      }
    })

    return out
  }

  saveTitle(newTitle: string, newSubtitle: string) {
    this.project.setTitle(newTitle);
    this.project.setSubtitle(newSubtitle)
  }

  changeStartDate(newStartDate: Date): void {
    this.project.changeStartDate(newStartDate);
  }

  resetActualStartDates() {
    this.project.getAllItems().forEach((item: Item) => {
      if (item.id !== this.project.getStartMilestone().id && !(item instanceof Process)) {
        item.setActualStartDate(undefined);
      }
    });
  }

  private generateId(parentId: number): number {
    const parent = this.project.getItemById(parentId);
    if (!parent) {
      console.log(this.project);
      throw new Error(`Parent with ID ${parentId} not found.`);
    }

    if (!(parent instanceof Process)) {
      throw new Error(`Parent with ID ${parentId} is not a process.`);
    }

    let newID = parent.children.length + 1;
    newID += parent.id == this.project.getRoot().id ? 0 : parent.id * 10;
    return newID;
  }

  addNewItem(itemData: IItemData): void {
    try {
      const id = this.generateId(itemData.parentId);
      const item = itemDataToItem(id, itemData, this.project);
      const parent = this.project.getItemById(itemData.parentId);

      if (parent instanceof Process) {
        this.project.addItem(item, parent);
      } else {
        throw new Error(
          `Parent process with ID ${itemData.parentId} not found.`
        );
      }

      // Agregar relaciones de precedencia
      itemData.predecessorIds.forEach((predId) => {
        const pred = this.project.getItemById(predId);
        if (pred) this.project.addRelation(pred, item);
      });
      
      // Agregar actualStartDate
      if ((itemData as ITaskData | IMilestoneData).actualStartDate) {
        const dateString = (itemData as ITaskData | IMilestoneData).actualStartDate as TDateString
        item.setActualStartDate(displayStringToDate(dateString));
      }

      this.normalizeItemIds();
    } catch (error) {
      console.error('Error adding new item:', error);
      throw new Error(`Error al agregar nuevo item: ${error.message}`);
    }
  }

  // En el método editItem, agregar manejo de useManualCost
  editItem(id: number, itemData: IItemData): void {
    try {
      this.project.editItem(itemData);
    } catch (error) {
      console.error('Error editing item:', error);
      throw new Error(`Error al editar item: ${error.message}`);
    }
  }

  changeOrder(item: Item, sense: 'up' | 'down'): void {
    try {
      const parent = item.parent;

      if (!(parent instanceof Process)) {
        throw new Error('No se puede cambiar el orden de un ítem sin un proceso padre.');
      }

      if (item.id === this.project.getStartMilestone().id || item.id === this.project.getEndMilestone().id) {
        throw new Error('No se puede cambiar el orden de los hitos de inicio y fin.');
      }

      const children = parent.children;
      const itemIndex = children.indexOf(item);
      let newIndex;

      if (sense === 'up') {
        // Mover el ítem hacia arriba
        if (itemIndex <= 0) return; // Ya está en la primera posición

        const neighbor = children[itemIndex - 1];
        if (neighbor.id === this.project.getStartMilestone().id) {
          return; // No se puede mover por encima del hito de inicio
        }

        newIndex = itemIndex - 1;
      } else { // sense === 'down'
        // Mover el ítem hacia abajo
        if (itemIndex >= children.length - 1) return; // Ya está en la última posición

        const neighbor = children[itemIndex + 1];
        if (neighbor.id === this.project.getEndMilestone().id) {
          return; // No se puede mover por debajo del hito de fin
        }

        newIndex = itemIndex + 1;
      }

      // Intercambiar los ítems en el array
      [children[itemIndex], children[newIndex]] = [children[newIndex], children[itemIndex]];

      this.normalizeItemIds();
      this.project.calculateItemDates();

    } catch (error) {
      console.error('Error al cambiar el orden del ítem:', error);
      throw new Error(`Error al cambiar el orden: ${error.message}`);
    }
  }

  deleteItem(id: number): void {
    try {
      const item = this.project.getItemById(id);
      if (!item) return;

      // Si es un proceso, eliminar recursivamente sus hijos
      if (item instanceof Process) {
        for (const child of [...item.children]) {
          this.deleteItem(child.id);
        }
      }

      // Eliminar dependencias cruzadas
      for (const otherItem of this.project.getAllItems().values()) {
        otherItem.predecessors.delete(item);
      }

      (item.parent as Process).removeChild(id);
      this.project.getAllItems().delete(id);

      this.normalizeItemIds();
      this.project.calculateItemDates();
    } catch (error) {
      console.error('Error deleting item:', error);
      throw new Error(`Error al eliminar item: ${error.message}`);
    }
  }

  private normalizeItemIds(): void {
    const newMap = new Map<number, Item>();

    let counter = 1;

    const assignIds = (item: Item, parent: Process): void => {
      if (
        item === this.project.getStartMilestone() ||
        item === this.project.getEndMilestone() ||
        item === this.project.getRoot()
      ) {
        // Mantener sus IDs originales
        newMap.set(item.id, item);
        return;
      }

      const parentId =
        parent === this.project.getRoot() ? '' : parent.id.toString();
      const newId = Number(
        `${parentId}${parent === this.project.getRoot()
          ? counter++
          : parent.children.indexOf(item) + 1
        }`
      );

      item.forceSetId(newId);
      newMap.set(newId, item);
    };

    const update = (item: Item, _: number, parent: Process) => {
      assignIds(item, parent);
    };

    newMap.set(this.project.getRoot().id, this.project.getRoot());
    this.project.traverse(update);

    // Reemplazar el mapa global
    const projectItemsMap = this.project['allItemsMap'];
    projectItemsMap.clear();
    newMap.forEach((item, id) => {
      projectItemsMap.set(id, item);
    });
  }

  /**
  * Calcula el gasto diario del proyecto, cubriendo cada día desde el inicio hasta el fin.
  * @param spendingMethod El método de cálculo a usar.
  * @returns Un mapa con las fechas como claves y el gasto total de ese día como valor.
  */
  calculateDailySpending(spendingMethod: SpendingMethod): Array<{ d: string, v: number }> {
    const dailySpending = new Map<string, number>();
    const project = this.getProject();

    const projectStartDate = project.getProjectStartDate();
    const projectEndDate = project.getProjectEndDate();

    if (!projectStartDate || !projectEndDate) {
      console.warn('Fechas de proyecto no definidas. No se puede calcular el gasto.');
      return [];
    }

    // Recorre cada día entre el inicio y el fin del proyecto
    let currentDate = new Date(projectStartDate);
    while (currentDate <= projectEndDate) {
      const formattedDate = formatDateToDisplay(currentDate) as TDateString;
      let dailyCost = 0;
      project.traverse((item: Item) => {
        dailyCost += item.getDailyCost(currentDate, spendingMethod);
      })

      dailySpending.set(formattedDate, dailyCost);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return Array.from(dailySpending.entries()).map(([d, v]) => ({ d, v }));
  }


  /** Descarga el proyecto como archivo prj */
  downloadProjectAsJSON(): void {
    const data = this.project.getData()
    data.items = data.items.map((iid: IItemData) => {
      if (iid.type == 'milestone' || iid.type == 'task') {
        const idata = iid as (IMilestoneData | ITaskData);
        return {
          ...idata,
          calculatedStartDate: undefined,
        }
      } else {
        return iid
      }
    })
    const blob = new Blob([JSON.stringify(data, null, 0)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.project.getTitle()}.prj`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Carga un proyecto desde un objeto JSON */
  loadProjectFromJSON(json: any): void {
    // Verify json has the correct IProjectData structure
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid project data: must be a JSON object');
    }

    const requiredFields = ['id', 'startDate', 'title', 'subtitle', 'items'];
    for (const field of requiredFields) {
      if (!(field in json)) {
        throw new Error(`Invalid project data: missing required field '${field}'`);
      }
    }

    if (!Array.isArray(json.items)) {
      throw new Error('Invalid project data: items must be an array');
    }
    this.project = Project.deserializeProject(json);
    this.normalizeItemIds();
  }

  /** Carga un proyecto desde un archivo prj */
  async loadProjectFromFile(file: File): Promise<void> {
    const text = await file.text();
    const json = JSON.parse(text);
    this.loadProjectFromJSON(json);
  }

  /******************************************************************************************************* */
  // TEMPLATES
  /**
   * 
   * @param tid 
   */
  chargeTemplate(tid: TTemplateID) {
    this.project = getTemplateProject(tid)
  }

  getAllTemplatesHeaders(): IProjectHeader[] {
    return getAllTemplateProjectHeaders()
  }
}
