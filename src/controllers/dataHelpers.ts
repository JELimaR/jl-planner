import type { IItemData, Item } from '../models/Item';
import { Milestone } from '../models/Milestone';
import { IProcessData, Process } from '../models/Process';
import type { Project } from '../models/Project';
import { ITaskData, Task } from '../models/Task';

/**
 * Crea un nuevo Item (Task, Milestone o Process) desde los datos de un item.
 * @param id - El ID del item.
 * @param data - Los datos del item.
 * @param project - El proyecto al que pertenece el item.
 * @returns El item creado.
 */
export function itemDataToItem(  id: number,  data: IItemData,  project: Project): Item {
  try {
    const parent = data.parentId
      ? (project.getItemById(data.parentId) as Process)
      : undefined;

    switch (data.type) {
      case 'task':
        return new Task(
          id,
          data.name,
          (data as ITaskData).duration || 1,
          parent,
          data.detail,
          data.cost || 0
        );
      case 'milestone':
        return new Milestone(
          id,
          data.name,
          parent,
          data.detail,
          data.cost || 0
        );
      case 'process':
        return new Process(
          id,
          data.name,
          parent,
          data.detail,
          data.cost || 0,
          (data as IProcessData).useManualCost || false
        );
      default:
        throw new Error(`Tipo de item no válido: ${data.type}`);
    }
  } catch (error) {
    console.error('Error creating item from form values:', error);
    throw new Error(`Error al crear item: ${error.message}`);
  }
}
