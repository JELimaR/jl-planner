import { DependencyGraph } from './DependencyGraph';
import { ITaskData, Task } from './Task';
import { IMilestoneData, Milestone } from './Milestone';

const ONEDAY = 24 * 60 * 60 * 1000;

/**
 * Calcula las fechas automáticas de inicio para los nodos del grafo.
 * Respeta las dependencias entre nodos y sus fechas de fin.
 * @param graph El grafo de dependencias.
 * @param defaultStart Fecha inicial del proyecto.
 */

/**
 * Calcula las fechas de inicio automáticas (calculatedStartDate) para cada Task y Milestone del grafo.
 * Se ignoran los retrasos manuales al calcular la lógica del proyecto.
 *
 * @param graph Grafo de dependencias.
 * @param projectStartDate Fecha de inicio del proyecto (para el nodo inicial).
 */
export function calculateDatesFromGraph(
  graph: DependencyGraph,
  projectStartDate: Date
): void {
  const visited = new Set<number>();

  const resolve = (id: number): void => {
    if (visited.has(id)) return;
    visited.add(id);

    const node = graph.nodes.get(id);
    if (!node) return;

    const deps = graph.getPredecessors(id);
    for (const depId of deps) {
      resolve(depId);
    }

    // Obtener la fecha más tardía de finalización de sus predecesores
    let latestEnd: Date = new Date(projectStartDate);
    for (const depId of deps) {
      const dep = graph.nodes.get(depId);
      if (!dep) continue;

      const depEnd = dep.getEndDate();
      if (depEnd && depEnd > latestEnd) {
        latestEnd = depEnd;
      }
    }

    const calculatedStart = new Date(latestEnd.getTime() + 0 * ONEDAY);

    // Solo se actualiza si es una Task o Milestone (los Process se manejan recursivamente en otro lugar)
    if (node instanceof Task || node instanceof Milestone) {
      node.setCalculatedStartDate(calculatedStart);
    }
  };

  for (const id of graph.nodes.keys()) {
    resolve(id);
  }
}

/********************************************************************************************************************************** */

export interface CriticalPath {
  path: Array<Task | Milestone>;
  totalDelayDays: number;
}

export interface ICriticalPathData {
  path: Array<ITaskData | IMilestoneData>;
  totalDelayDays;
}

/**
 * Encuentra todos los caminos críticos en el grafo.
 * Un camino crítico es aquel donde cada nodo empieza justo después de que termine su dependencia más tardía.
 * Se priorizan caminos con nodos retrasados (mayor delay).
 * @param graph El grafo de dependencias.
 * @param startId ID del nodo de inicio.
 * @param endId ID del nodo de fin.
 * @returns Lista de caminos críticos (cada uno es una lista de Items).
 */
export function getCriticalPathsFromGraph(
  graph: DependencyGraph,
  startId: number,
  endId: number
): CriticalPath[] {
  const rawPaths: Array<Array<Task | Milestone>> = [];
  const path: Array<Task | Milestone> = [];

  const DFS = (current: Task | Milestone) => {
    path.push(current);

    if (current.id === endId) {
      rawPaths.push([...path]);
      path.pop();
      return;
    }

    const end = current.getEndDate();
    if (!end) {
      path.pop();
      return;
    }

    const successors = graph
      .getSuccessors(current.id)
      .map((id) => graph.nodes.get(id))
      .filter((i): i is Task | Milestone => !!i);

    // Priorizar sucesores con mayor atraso (actual > calculado)
    successors.sort((a, b) => b.getDelayInDays() - a.getDelayInDays());

    for (const next of successors) {
      const nextStart = next.getCalculatedStartDate();
      if (!nextStart) continue;

      // Considerar camino crítico si no hay holgura
      const gap = nextStart.getTime() - end.getTime();
      if (gap >= 0 && gap < ONEDAY) {
        DFS(next);
      }
    }

    path.pop();
  };

  const startNode = graph.nodes.get(startId);
  if (startNode) DFS(startNode);

  const unique = filterRedundant(rawPaths);

  return unique.map((p) => ({
    path: p,
    totalDelayDays: p.reduce((sum, item) => sum + item.getDelayInDays(), 0),
  }));
}

/** Filtra caminos redundantes (subsecuencias de otros). */
function filterRedundant(
  paths: Array<Array<Task | Milestone>>
): Array<Array<Task | Milestone>> {
  return paths.filter(
    (a, i) => !paths.some((b, j) => i !== j && isSubsequence(a, b))
  );
}

function isSubsequence<A extends { id: number }>(a: A[], b: A[]): boolean {
  let j = 0;
  for (const item of a) {
    j = b.findIndex((x, idx) => idx >= j && x.id === item.id);
    if (j < 0) return false;
    j++;
  }
  return true;
}
