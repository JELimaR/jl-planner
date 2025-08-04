import { getExampleProject } from '../models/getExampleProject';
import type { Item } from '../models/Item';
import { Milestone } from '../models/Milestone';
import { Process } from '../models/Process';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import type { FormItemValues } from './addItemValues';
import { formValuesToItem } from './dataHelpers';
import { deserializeProject, SerializedProject, serializeProject } from './projectSerializer';

export class ProjectController {
  private static instance: ProjectController;
  private project: Project;

  private constructor(id: string, startDate: Date) {
    this.createNewProject(id, startDate);
  }

  static getInstance(id: string, startDate?: Date): ProjectController {
    if (!this.instance) {
      startDate = startDate || new Date();
      this.instance = new ProjectController(id, startDate);
    }
    return this.instance;
  }

  createNewProject(id: string, startDate: Date): void {
    this.project = new Project(id, startDate);
  }

  getProject(): Project {
    return this.project;
  }

  getAllItems(): Item[] {
    const out: Item[] = []
    this.project.getAllItems().forEach(item => {

      out.push(item)

    })

    return out
  }

  getAllProcess(): Process[] {
    const out: Process[] = []
    this.project.getAllItems().forEach(item => {
      if (item instanceof Process) {
        out.push(item)
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
      if (
        item.id !== this.project.getStartMilestone().id &&
        !(item instanceof Process)
      ) {
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

  addNewItem(itemData: FormItemValues): Item {
    try {
      const id = this.generateId(itemData.processId);
      const item = formValuesToItem(id, itemData, this.project);
      const parent = this.project.getItemById(itemData.processId);

      if (parent instanceof Process) {
        this.project.addItem(item, parent);
      } else {
        throw new Error(
          `Parent process with ID ${itemData.processId} not found.`
        );
      }

      // Agregar relaciones de precedencia
      itemData.predecessorIds.forEach((predId) => {
        const pred = this.project.getItemById(predId);
        if (pred) this.project.addRelation(pred, item);
      });

      this.normalizeItemIds();
      return item;
    } catch (error) {
      console.error('Error adding new item:', error);
      throw new Error(`Error al agregar nuevo item: ${error.message}`);
    }
  }

  // En el método editItem, agregar manejo de useManualCost
  editItem(id: number, itemData: FormItemValues): void {
    try {
      const existingItem = this.project.getItemById(id);
      if (!existingItem) {
        throw new Error(`Item with ID ${id} not found.`);
      }

      // Asegurarse de que el tipo de ítem no cambie
      if (
        (existingItem instanceof Task && itemData.type !== 'task') ||
        (existingItem instanceof Milestone && itemData.type !== 'milestone') ||
        (existingItem instanceof Process && itemData.type !== 'process')
      ) {
        throw new Error(`No se puede cambiar el tipo de un ítem.`);
      }

      // Asegurarse de que el padre no cambie
      if (
        (existingItem.parent && itemData.processId && existingItem.parent.id !== itemData.processId) ||
        (!existingItem.parent && itemData.processId)
      ) {
        throw new Error(`No se puede cambiar el padre de un ítem.`);
      }

      existingItem.name = itemData.name;
      existingItem.detail = itemData.detail;

      // Actualizar cost si está disponible
      if (itemData.cost !== undefined) {
        existingItem.setCost(itemData.cost);
      }

      // Actualizar useManualCost para procesos
      if (existingItem instanceof Process && itemData.useManualCost !== undefined) {
        existingItem.setUseManualCost(itemData.useManualCost);
      }

      // Eliminar las relaciones de predecesores existentes y añadir las nuevas
      existingItem.predecessors.clear();
      itemData.predecessorIds.forEach((predId) => {
        const pred = this.project.getItemById(predId);
        if (pred) {
          this.project.addRelation(pred, existingItem);
        }
      });

      if (existingItem instanceof Task && itemData.type === 'task') {
        existingItem.setManualDuration(itemData.duration!);
        if (itemData.actualStartDate) {
          existingItem.setActualStartDate(itemData.actualStartDate);
        } else {
          existingItem.setActualStartDate(undefined);
        }
      } else if (existingItem instanceof Milestone && itemData.type === 'milestone') {
        if (itemData.actualStartDate) {
          existingItem.setActualStartDate(itemData.actualStartDate);
        } else {
          existingItem.setActualStartDate(undefined);
        }
      }

      this.project.calculateItemDates();
      this.normalizeItemIds();
    } catch (error) {
      console.error('Error editing item:', error);
      throw new Error(`Error al editar item: ${error.message}`);
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
    const idMap = new Map<number, number>(); // oldId → newId

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
      idMap.set(item.id, newId);

      item.id = newId;
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

  /** Descarga el proyecto como archivo JSON */
  downloadProjectAsJSON(): void {
    const data = serializeProject(this.project);
    const blob = new Blob([JSON.stringify(data, null, 0)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mi_proyecto.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Carga un proyecto desde un archivo JSON */
  async loadProjectFromFile(file: File | SerializedProject): Promise<void> {
    let json: SerializedProject;
    if (file instanceof File) {
      const text = await file.text();
      json = JSON.parse(text);
    } else {
      json = file;
    }
    console.log(json);
    this.project = deserializeProject(json);
    this.normalizeItemIds();
  }

  chargeExampleProject() {
    const P = getExampleProject();
    P.getItemById(21)!.setActualStartDate(new Date('2025-08-29'));
    P.getItemById(3)!.setActualStartDate(new Date('2025-09-29'));
    (P.getItemById(3) as Task).setManualDuration(3);
    P.getCriticalPaths();

    this.project = P;
  }
}

export default ProjectController;
