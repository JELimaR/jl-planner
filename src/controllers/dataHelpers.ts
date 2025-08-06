import type { Item } from '../models/Item';
import { Milestone } from '../models/Milestone';
import { Process } from '../models/Process';
import type { Project } from '../models/Project';
import { Task } from '../models/Task';
import type { FormItemValues } from './addItemValues';

export function itemToFormValues(item: Item): FormItemValues {
  const processId = item.parent?.id;
  if (!processId) {
    throw new Error(`Item ${item.name} no tiene proceso padre`);
  }
  const common = {
    title: `Editar: (#${item.id} - ${item.name})`,
    id: item.id,
    type: item._type,
    name: item.name,
    detail: item.detail,
    processId: processId,
    predecessorIds: Array.from(item.predecessors).map((pred) => pred.id),
    cost: item.getTotalCost() || 0,
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
  if (item instanceof Process) {
    return {
      ...common,
      useManualCost: item.getUseManualCost(), // Incluir useManualCost para procesos
    };
  }

  return common;
}

/**
 * Crea un nuevo Item (Task, Milestone o Process) desde los valores del formulario.
 */
export function formValuesToItem(
  id: number,
  values: FormItemValues,
  project: Project
): Item {
  try {
    const parent = values.processId
      ? (project.getItemById(values.processId) as Process)
      : undefined;

    switch (values.type) {
      case 'task':
        return new Task(
          id,
          values.name,
          values.duration || 1,
          parent,
          values.detail,
          values.cost || 0
        );
      case 'milestone':
        return new Milestone(
          id,
          values.name,
          parent,
          values.detail,
          values.cost || 0
        );
      case 'process':
        return new Process(
          id,
          values.name,
          parent,
          values.detail,
          values.cost || 0,
          values.useManualCost || false // Incluir useManualCost para procesos
        );
      default:
        throw new Error(`Tipo de item no válido: ${values.type}`);
    }
  } catch (error) {
    console.error('Error creating item from form values:', error);
    throw new Error(`Error al crear item: ${error.message}`);
  }
}
