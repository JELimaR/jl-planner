import type { IProjectData } from '../../src/models/Project';
import type { IItemData } from '../../src/models/Item';
import { flattenItemsList } from '../../stores/project';
import {
  getXPositionEnd,
  getXPositionStart,
  itemPositionLeft,
  itemPositionRight,
  type Scale,
} from './ganttHelpers';
import { CRITICAL_COLOR } from '../../src/views/colors';

function isCriticalArrow(projectData: IProjectData, pred: IItemData, succ: IItemData, criticalPathIndex: number | undefined) {
  const criticalPaths = projectData.criticalPaths;
  
  if (!criticalPaths || criticalPaths.length === 0) {
    return false;
  }

   //
  if (criticalPathIndex == undefined) {
    return false
  }
  
  // If no specific path is selected, check if arrow is in any critical path
  if (criticalPathIndex == -1) {
    let out = false;
    criticalPaths.forEach((path) => {
      for (let i = 1; i < path.path.length && !out; i++) {
        out = path.path[i - 1].id == pred.id && path.path[i].id == succ.id;
      }
    });
    return out;
  }
  
  // If a specific path is selected, check only that path
  if (criticalPathIndex >= 0 && criticalPathIndex < criticalPaths.length) {
    const selectedPath = criticalPaths[criticalPathIndex];
    for (let i = 1; i < selectedPath.path.length; i++) {
      if (selectedPath.path[i - 1].id == pred.id && selectedPath.path[i].id == succ.id) {
        return true;
      }
    }
  }
  
  return false;
}

export function drawAllArrows(
  svg: SVGSVGElement,
  projectData: IProjectData, // Refactorizado
  calendarStartDate: Date,
  scale: Scale,
  rowHeight: number,
  criticalPathIndex: number | undefined
) {
  addArrowHeadDef(svg);
  let rowIndex = 0;

  const flattenedItems = flattenItemsList(projectData.items);
  for (const item of flattenedItems) {
    if (item.type === 'task' || item.type === 'milestone') {
      const start = item.startDate ? new Date(item.startDate) : null;
      const end = item.endDate ? new Date(item.endDate) : null;
      if (!start || !end) continue;

      const startX = getXPositionStart(item, calendarStartDate, scale);
      const endX = getXPositionEnd(item, calendarStartDate, scale);

      const centerY = rowIndex * rowHeight + rowHeight / 2;
      itemPositionLeft.set(item.id, { x: startX, y: centerY });
      itemPositionRight.set(item.id, { x: endX, y: centerY });
    }

    rowIndex++;
  }

  for (const item of flattenedItems) {
    if (item.type !== 'task' && item.type !== 'milestone') continue;

    const targetPos = itemPositionLeft.get(item.id);
    if (!targetPos) continue;

    for (const predId of item.predecessorIds) {
      const pred = flattenedItems.find(i => i.id === predId);
      if (!pred || (pred.type !== 'task' && pred.type !== 'milestone')) continue;

      const sourcePos = itemPositionRight.get(pred.id);
      if (!sourcePos) continue;

      const color: string = isCriticalArrow(projectData, pred, item, criticalPathIndex)
        ? CRITICAL_COLOR
        : '#555';
      drawArrow(
        svg,
        sourcePos,
        targetPos,
        rowHeight,
        color,
        isCriticalArrow(projectData, pred, item, criticalPathIndex)
      );
    }
  }
}

// ... El resto de las funciones auxiliares se mantienen igual.
/**
 * Dibuja una flecha desde un item fuente hasta uno destino.
 * Estilo ortogonal: derecha → abajo → (si es necesario) izquierda → abajo → llegada.
 */
function drawArrow(
  svg: SVGSVGElement,
  source: { x: number; y: number },
  target: { x: number; y: number },
  rowHeight: number,
  color: string,
  critical: boolean
) {
  const offset = 12; // margen inicial/final horizontal
  const downStep = rowHeight * 0.55;

  const sx = source.x;
  const sy = source.y;

  const tx = target.x - offset;
  const ty = target.y;

  // Dibujar punto de salida visual
  const circle = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle'
  );
  circle.setAttribute('cx', String(sx));
  circle.setAttribute('cy', String(sy));
  circle.setAttribute('r', critical ? '3' : '2.5');
  circle.setAttribute('fill', '#555');
  svg.appendChild(circle);
  // Dibujar punto de llegada visual
  const circleEnd = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle'
  );
  circleEnd.setAttribute('cx', String(target.x));
  circleEnd.setAttribute('cy', String(target.y));
  circleEnd.setAttribute('r', critical ? '3' : '2.5');
  circleEnd.setAttribute('fill', '#555');
  svg.appendChild(circleEnd);

  // Crear el path
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', critical ? '3.0' : '0.7');
  path.setAttribute('stroke-opacity', '1.0');
  path.setAttribute('stroke-dasharray', critical ? '0' : '5 5 5');
  //path.setAttribute('marker-end', 'url(#arrowhead)');

  let d = `M ${sx},${sy} `;

  const h1 = sx + offset;
  d += `L ${h1},${sy} `; // primer paso horizontal

  if (h1 > tx) {
    const midY = sy + (ty > sy ? 1 : -1) * downStep;
    d += `L ${h1},${midY} `; // baja
    d += `L ${tx},${midY} `; // cruza hacia izquierda
  } else {
    d += `L ${h1},${ty} `; // baja
  }

  d += `L ${tx},${ty} `; // baja a la altura del destino
  d += `L ${tx + offset},${ty}`; // entra al destino

  path.setAttribute('d', d);
  svg.appendChild(path);
}

/****************************** */
function addArrowHeadDef(svg: SVGSVGElement) {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'marker'
  );

  marker.setAttribute('id', 'arrowhead');
  marker.setAttribute('markerWidth', '7');
  marker.setAttribute('markerHeight', '4');
  marker.setAttribute('refX', '7');
  marker.setAttribute('refY', '2');
  marker.setAttribute('orient', 'auto');
  marker.setAttribute('markerUnits', 'strokeWidth');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M0,0 L10,3.5 L0,7 Z');
  path.setAttribute('fill', '#333');
  marker.appendChild(path);

  defs.appendChild(marker);
  svg.appendChild(defs);
}