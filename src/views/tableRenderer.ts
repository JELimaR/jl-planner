import type { Item } from '../models/Item';
import { Process } from '../models/Process';
import type { Project } from '../models/Project';
import { Task } from '../models/Task';
import { processColorMap } from './colors';

function formatDate(date?: Date): string {
  return date ? date.toISOString().split('T')[0] : '';
}

export function renderTaskTable(project: Project, tbody: HTMLElement) {
  tbody.innerHTML = '';

  project.calculateItemDates();

  const renderRecursive = (item: Item, depth: number = 0, _: Process) => {
    const start = item.getStartDate();
    const end = item.getEndDate();
    const duration = item instanceof Task ? item.duration : '-';
    let predecesors = Array.from(item.predecessors)
      .map((i) => i.id)
      .filter((i) => i !== project.getStartMilestone().id)
      .join(', ');
    predecesors = item.id === project.getEndMilestone().id ? '' : predecesors;

    const tr = document.createElement('tr');

    // Estilo visual por nivel jerárquico
    const borderWidth = `${Math.max(0.5, 4 / 2 ** depth)}px`;
    const opacity = 1 - depth * 0.05;

    // Color de fondo asociado al proceso
    let bgColor = processColorMap.get(item.id)!;

    tr.setAttribute(
      'style',
      `
        font-size: 12px;
        border-bottom: ${borderWidth} solid rgba(0,0,0,${opacity}) !important;
        background-color: ${bgColor} !important;
      `.trim()
    );

    tr.innerHTML = `
        <td style="padding-left: ${5 + 0 * depth * 16}px; font-size=8px">${
      item.id
    }</td>
        <td>${item.name}</td>
        <td>${item.detail ? item.detail : ''}</td>
        <td>${duration}</td>
        <td>${formatDate(start)}</td>
        <td>${formatDate(end)}</td>
        <td>${predecesors}</td>
        <td class="action-buttons">
          <button
            class="btn btn-sm btn-primary" id="edit-item-button-${item.id}"
            
            
            data-action="edit"
            data-id="${item.id}"
          >✏️</button>
          <button
            class="btn btn-sm btn-danger" id="delete-item-button-${item.id}"
            
            
            data-action="delete"
            data-id="${item.id}"
          >🗑️</button>
        </td>
      `;

    tbody.appendChild(tr);
  };

  project.traverse(renderRecursive);
}
