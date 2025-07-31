import type { CriticalPath } from '../models/graphCalculation';
import type { Item } from '../models/Item';
import { Milestone } from '../models/Milestone';
import type { Project } from '../models/Project';
import { Task } from '../models/Task';
import { CRITICAL_COLOR } from './colors';
import {
  getXPositionEnd,
  getXPositionStart,
  itemPositionLeft,
  itemPositionRight,
  type Scale,
} from './ganttHelpers';

function isCriticalArrow(project: Project, pred: Item, succ: Item) {
  const criticalPaths = project.getCriticalPaths();
  let out = false;
  criticalPaths.forEach((path: CriticalPath) => {
    for (let i = 1; i < path.path.length && !out; i++) {
      out = path.path[i - 1].id == pred.id && path.path[i].id == succ.id;
    }
  });
  return out;
}

/**
 * Dibuja todas las flechas entre ítems (excepto procesos).
 */
export function drawAllArrows(
  svg: SVGSVGElement,
  project: Project,
  calendarStartDate: Date,
  scale: Scale,
  rowHeight: number
) {
  addArrowHeadDef(svg);
  let rowIndex = 0;

  project.traverse((item: Item) => {
    if (item instanceof Task || item instanceof Milestone) {
      const start = item.getStartDate();
      const end = item.getEndDate();
      if (!start || !end) return;

      // Punto de llegada de la flecha: final del item (x fin)
      const startX = getXPositionStart(item, calendarStartDate, scale);
      // Punto de salida de la flecha: final del item (x fin)
      const endX = getXPositionEnd(item, calendarStartDate, scale);

      const centerY = rowIndex * rowHeight + rowHeight / 2;
      itemPositionLeft.set(item.id, { x: startX, y: centerY });
      itemPositionRight.set(item.id, { x: endX, y: centerY });
    }

    rowIndex++;
  });

  // Dibujar flechas entre ítems (solo tareas e hitos)
  for (const item of project.getAllItems().values()) {
    if (!(item instanceof Task || item instanceof Milestone)) continue;

    const targetPos = itemPositionLeft.get(item.id);
    if (!targetPos) continue;

    for (const pred of item.predecessors) {
      if (!(pred instanceof Task || pred instanceof Milestone)) continue;

      const sourcePos = itemPositionRight.get(pred.id);
      if (!sourcePos) continue;

      const color: string = isCriticalArrow(project, pred, item)
        ? CRITICAL_COLOR
        : '#555'; //|| processColorMap.get(pred.id) || '#4545';
      drawArrow(
        svg,
        sourcePos,
        targetPos,
        rowHeight,
        color,
        isCriticalArrow(project, pred, item)
      );
    }
  }
}

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
