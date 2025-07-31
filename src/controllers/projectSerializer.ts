import type { Item } from '../models/Item';
import { Milestone } from '../models/Milestone';
import { Process } from '../models/Process';
import { Project } from '../models/Project';
import { Task } from '../models/Task';

export interface SerializedItem {
  id: number;
  type: 'task' | 'milestone' | 'process';
  name: string;
  detail?: string;
  duration?: number;
  actualStartDate?: string; // ISO format
  processId: number;
  predecessorIds: number[];
  children?: SerializedItem[]; // solo para Process
}

export interface SerializedProject {
  title: string;
  subtitle: string;
  startDate: string;
  items: SerializedItem[];
}

export function serializeProject(project: Project): SerializedProject {
  const startDate = project.getProjectStartDate().toISOString();
  const items: SerializedItem[] = [];

  const serializeItem = (item: Item, parent: Process): SerializedItem => {
    const base = {
      id: item.id,
      name: item.name,
      detail: item.detail,
      processId: parent.id,
      predecessorIds: Array.from(item.predecessors).map((p) => p.id),
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
    title: project.getTitle(),
    subtitle: project.getSubtitle(),
    startDate,
    items,
  };
}

export function deserializeProject(data: SerializedProject): Project {
  const project = new Project(new Date(data.startDate));
  project.setTitle(data.title);
  project.setSubtitle(data.subtitle);
  data.items.forEach((serial: SerializedItem) => {
    if (
      !(
        serial.id == project.getEndMilestone().id ||
        serial.id == project.getStartMilestone().id
      )
    ) {
      serial2Item(project, serial, project.rootProcess);
    }
  });

  restoreRelationsRecursively(project, data.items);

  return project;
}

function serial2Item(
  project: Project,
  serial: SerializedItem,
  parent: Process
): void {
  if (serial.processId !== parent.id) {
    throw new Error(`${serial.processId} - ${parent.id}`);
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
      serial.children?.forEach((child: SerializedItem) => {
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
  serializedItems: SerializedItem[]
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
