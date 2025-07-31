import type { Item } from '../models/Item';
import { Milestone } from '../models/Milestone';
import { Process } from '../models/Process';
import type { Project } from '../models/Project';
import { Task } from '../models/Task';
import type { FormItemValues } from './addItemValues';

export function itemToFormValues(item: Item): FormItemValues {
  const processId = item.parent?.id;
  if (!processId) {
    throw new Error(``);
  }
  const common = {
    id: item.id,
    type: item.type,
    name: item.name,
    detail: item.detail,
    processId: processId,
    predecessorIds: Array.from(item.predecessors).map((pred) => pred.id),
  };

  if (item instanceof Task) {
    return {
      ...common,
      duration: item.duration,
      actualStartDate: item.hasActualStartDate()
        ? item.getStartDate()
        : undefined,
    };
  }

  if (item instanceof Milestone) {
    return {
      ...common,
      actualStartDate: item.hasActualStartDate()
        ? item.getStartDate()
        : undefined,
    };
  }

  // Proceso
  return {
    ...common,
  };
}

/************************************************************************************************ */

/**
 * Crea un nuevo Item (Task, Milestone o Process) desde los valores del formulario.
 * @param values - Los datos capturados desde el formulario.
 * @param generateId - Una función para obtener el próximo ID disponible.
 */
export function formValuesToItem(
  id: number,
  values: FormItemValues,
  project: Project
): Item {
  let newItem: Item;
  const parent = project.getItemById(values.processId);

  if (!parent) {
    throw new Error(``);
  }

  if (!(parent instanceof Process)) {
    throw new Error(``);
  }

  switch (values.type) {
    case 'task': {
      const task = new Task(
        id,
        values.name,
        values.duration || 1,
        parent,
        values.detail
      );
      if (values.actualStartDate) {
        task.setActualStartDate(values.actualStartDate);
      }
      newItem = task;
      break;
    }
    case 'milestone': {
      const milestone = new Milestone(id, values.name, parent, values.detail);
      if (values.actualStartDate) {
        milestone.setActualStartDate(values.actualStartDate);
      }
      newItem = milestone;
      break;
    }
    case 'process': {
      newItem = new Process(id, values.name, parent, values.detail);
      break;
    }
    default:
      throw new Error(`Tipo de ítem desconocido: ${values.type}`);
  }

  // Asignar predecesores
  if (values.predecessorIds?.length) {
    for (const predId of values.predecessorIds) {
      const pred = project.getItemById(predId);
      if (pred) newItem.predecessors.add(pred);
    }
  }

  return newItem;
}
