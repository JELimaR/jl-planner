import type { IItemData, Item } from '../models/Item';
import { Milestone, IMilestoneData } from '../models/Milestone';
import { IProcessData, Process } from '../models/Process';
import type { Project } from '../models/Project';
import { ITaskData, Task } from '../models/Task';
import { displayStringToDate } from '../models/dateFunc';

/**
 * Crea un nuevo Item (Task, Milestone o Process) desde los datos de un item.
 * @param id - El ID del item.
 * @param data - Los datos del item.
 * @param project - El proyecto al que pertenece el item.
 * @returns El item creado.
 */
export function itemDataToItem(id: number, data: IItemData, project: Project): Item {
  try {
    const parent = data.parentId
      ? (project.getItemById(data.parentId) as Process)
      : undefined;

    let item: Item;

    switch (data.type) {
      case 'task': {
        const taskData = data as ITaskData;
        item = new Task(
          id,
          taskData.name,
          taskData.duration || 1,
          parent,
          taskData.detail,
          taskData.cost || 0
        );
        // Manejar actualStartDate si está presente
        if (taskData.actualStartDate) {
          item.setActualStartDate(displayStringToDate(taskData.actualStartDate));
        }        
        // Manejar manualDuration si está presente
        if (taskData.manualDuration !== undefined) {
          (item as Task).setManualDuration(taskData.manualDuration);
        }
        break;
      }
      
      case 'milestone': {
        const milestoneData = data as IMilestoneData;
        item = new Milestone(
          id,
          milestoneData.name,
          parent,
          milestoneData.detail,
          milestoneData.cost || 0
        );
        // Manejar actualStartDate si está presente
        if (milestoneData.actualStartDate) {
          item.setActualStartDate(displayStringToDate(milestoneData.actualStartDate));
        }
        break;
      }
      
      case 'process': {
        const processData = data as IProcessData;
        item = new Process(
          id,
          processData.name,
          parent,
          processData.detail,
          processData.cost || 0,
          processData.useManualCost || false
        );  
        // Nota: Los children del proceso se manejan típicamente en otro lugar
        // durante la deserialización del proyecto completo
        break;
      }
      default:
        throw new Error(`Tipo de item no válido: ${(data as any).type}`);
    }

    return item;
  } catch (error) {
    console.error('Error creating item from data:', error);
    throw new Error(`Error al crear item: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
