import type { IItemData, Item } from '../models/Item';
import { Milestone } from '../models/Milestone';
import { Process } from '../models/Process';
import { Project } from '../models/Project';
import { Task } from '../models/Task';

export interface IProjectData {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  items: IItemData[];
}

export function serializeProject(project: Project): IProjectData {
  const startDate = project.getProjectStartDate().toISOString();
  const items: IItemData[] = [];

  const serializeItem = (item: Item, parent: Process): IItemData => {
    const base = {
      id: item._id,
      name: item._name,
      detail: item._detail,
      processId: parent._id,
      predecessorIds: Array.from(item.predecessors).map((p) => p._id),
      cost: item.getTotalCost(),
    };

    if (item instanceof Task) {
      return {
        ...base,
        type: 'task',
        duration: item.duration,
        actualStartDate: item.hasActualStartDate()
          ? item.getStartDate()!.toISOString()
          : undefined,
      };
    } else if (item instanceof Milestone) {
      return {
        ...base,
        type: 'milestone',
        actualStartDate: item.hasActualStartDate()
          ? item.getStartDate()!.toISOString()
          : undefined,
      };
    } else if (item instanceof Process) {
      return {
        ...base,
        type: 'process',
        children: item.children.map((child) => serializeItem(child, item)),
      };
    } else {
      throw new Error('Unknown item type');
    }
  };

  for (const child of project.getRoot().children) {
    items.push(serializeItem(child, project.getRoot()));
  }

  return {
    id: project.getId(),
    title: project.getTitle(),
    subtitle: project.getSubtitle(),
    startDate,
    items,
  };
}

export function deserializeProject(data: IProjectData): Project {
  const project = new Project(data.id, new Date(data.startDate));
  project.setTitle(data.title);
  project.setSubtitle(data.subtitle);
  data.items.forEach((serial: IItemData) => {
    if (
      !(
        serial.id == project.getEndMilestone()._id ||
        serial.id == project.getStartMilestone()._id
      )
    ) {
      serial2Item(project, serial, project.getRoot());
    }
  });

  restoreRelationsRecursively(project, data.items);

  return project;
}

function serial2Item(
  project: Project,
  serial: IItemData,
  parent: Process
): void {
  if (serial.processId !== parent._id) {
    throw new Error(`${serial.processId} - ${parent._id}`);
  }
  let item: Item;
  switch (serial.type) {
    case 'task':
      if (!serial.duration) throw new Error(``);
      item = new Task(
        serial.id,
        serial.name,
        serial.duration,
        parent,
        serial.detail
      );
      project.addItem(item, parent);
      break;
    case 'milestone':
      item = new Milestone(serial.id, serial.name, parent, serial.detail);
      project.addItem(item, parent);
      break;
    case 'process':
      item = new Process(serial.id, serial.name, parent, serial.detail);
      project.addItem(item, parent);
      serial.children?.forEach((child: IItemData) => {
        serial2Item(project, child, item as Process);
      });
      break;
    default:
      throw new Error(``);
  }
  if (!!serial.actualStartDate) {
    item.setActualStartDate(new Date(serial.actualStartDate));
  }
}

function restoreRelationsRecursively(
  project: Project,
  serializedItems: IItemData[]
) {
  for (const serial of serializedItems) {
    const item = project.getItemById(serial.id);
    if (!item) {
      throw new Error(`Item no encontrado: ${serial.id}`);
    }

    // Asignar predecesores
    for (const pid of serial.predecessorIds) {
      const prede = project.getItemById(pid);
      if (!prede) {
        throw new Error(`Predecesor no encontrado: ${pid}`);
      }
      project.addRelation(prede, item);
    }

    // Si es un proceso, aplicar recursivamente a los hijos
    if (item instanceof Process && serial.children) {
      restoreRelationsRecursively(project, serial.children);
    }
  }
}
