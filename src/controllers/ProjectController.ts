import { getProject } from '../models/getProject';
import type { Item } from '../models/Item';
import { Milestone } from '../models/Milestone';
import { Process } from '../models/Process';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import type { FormItemValues } from './addItemValues';
import { formValuesToItem } from './dataHelpers';
import { deserializeProject, serializeProject } from './projectSerializer';

export class ProjectController {
  private static instance: ProjectController;
  private project: Project;

  private constructor(startDate: Date) {
    this.project = new Project(startDate);
  }

  static getInstance(startDate?: Date): ProjectController {
    if (!this.instance) {
      startDate = startDate || new Date();
      this.instance = new ProjectController(startDate);
    }
    return this.instance;
  }

  createNewProject(startDate: Date): void {
    this.project = new Project(startDate);
  }

  getProject(): Project {
    return this.project;
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
    newID += parent.id == this.project.rootProcess.id ? 0 : parent.id * 10;
    return newID;
  }

  addNewItem(itemData: FormItemValues): Item {
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
  }

  editItem(id: number, itemData: FormItemValues): void {
    let existingItem = this.project.getItemById(id);
    if (!existingItem) throw new Error(`Item with ID ${id} not found.`);

    const typeChanged =
      (existingItem instanceof Task && itemData.type !== 'task') ||
      (existingItem instanceof Milestone && itemData.type !== 'milestone') ||
      (existingItem instanceof Process && itemData.type !== 'process');

    if (existingItem instanceof Process && itemData.type !== 'process') {
      if (existingItem.children.length > 0) {
        throw new Error(
          `No se puede cambiar el tipo de un proceso que contiene ítems hijos.`
        );
      }
    }

    if (typeChanged) {
      this.deleteItem(id);
      const newItem = formValuesToItem(id, itemData, this.project);
      if (parent instanceof Process) {
        this.project.addItem(newItem, parent);
      } else {
        this.project.addItem(newItem);
      }

      itemData.predecessorIds.forEach((predId) => {
        const pred = this.project.getItemById(predId);
        if (pred) this.project.addRelation(pred, newItem);
      });
      existingItem = newItem;

      this.project.calculateItemDates();
    }

    // Si no cambió el tipo
    existingItem.name = itemData.name;
    existingItem.detail = itemData.detail;

    existingItem.predecessors.clear();
    itemData.predecessorIds.forEach((predId) => {
      const pred = this.project.getItemById(predId);
      if (pred) this.project.addRelation(pred, existingItem);
    });

    if (existingItem instanceof Task && itemData.type === 'task') {
      existingItem.setManualDuration(itemData.duration!);
      if (itemData.actualStartDate) {
        existingItem.setActualStartDate(itemData.actualStartDate);
      } else {
        existingItem.setActualStartDate(undefined);
      }
    } else if (
      existingItem instanceof Milestone &&
      itemData.type === 'milestone'
    ) {
      if (itemData.actualStartDate) {
        existingItem.setActualStartDate(itemData.actualStartDate);
      } else {
        existingItem.setActualStartDate(undefined);
      }
    }

    const newParent = itemData.processId
      ? this.project.getItemById(itemData.processId)
      : undefined;

    if (newParent instanceof Process && existingItem.parent !== newParent) {
      (existingItem.parent as Process).removeChild(id);
      newParent.addChild(existingItem);
      existingItem.parent = newParent;
    }

    this.normalizeItemIds();
    this.project.calculateItemDates();
  }

  deleteItem(id: number): void {
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
        `${parentId}${
          parent === this.project.getRoot()
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

    newMap.set(this.project.rootProcess.id, this.project.rootProcess);
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
  async loadProjectFromFile(file: File | object): Promise<void> {
    let json;
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
    const P = getProject();
    P.getItemById(21)!.setActualStartDate(new Date('2025-08-29'));
    P.getItemById(3)!.setActualStartDate(new Date('2025-09-29'));
    (P.getItemById(3) as Task).setManualDuration(3);
    P.getCriticalPaths();

    this.project = P;
  }
}

export default ProjectController;
