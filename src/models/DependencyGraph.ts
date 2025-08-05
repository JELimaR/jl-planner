import type { Project } from './Project';
import type { Item } from './Item';
import { Task } from './Task';
import { Milestone } from './Milestone';

type TNode = Task | Milestone;

export class DependencyGraph {
  nodes: Map<number, TNode> = new Map();
  edges: Map<number, Set<number>> = new Map();
  reverseEdges: Map<number, Set<number>> = new Map();

  constructor() {}

  /**
   * Agrega un nodo (Task o Milestone) al grafo.
   */
  addNode(item: TNode): void {
    if (!this.nodes.has(item._id)) {
      this.nodes.set(item._id, item);
      this.edges.set(item._id, new Set());
      this.reverseEdges.set(item._id, new Set());
    }
  }

  /**
   * Agrega una dependencia dirigida: from → to (from debe completarse antes que to).
   */
  addEdge(fromId: number, toId: number): void {
    if (!this.edges.has(fromId)) this.edges.set(fromId, new Set());
    if (!this.reverseEdges.has(toId)) this.reverseEdges.set(toId, new Set());

    this.edges.get(fromId)!.add(toId);
    this.reverseEdges.get(toId)!.add(fromId);
  }

  /**
   * Devuelve todos los nodos en orden topológico (respetando dependencias).
   * Usado para calcular fechas en orden correcto.
   */
  getTopologicalOrder(): Item[] {
    const result: Item[] = [];
    const visited = new Set<number>();
    const tempMark = new Set<number>();

    const visit = (id: number): void => {
      if (visited.has(id)) return;
      if (tempMark.has(id)) {
        throw new Error(`Ciclo detectado en el grafo en el nodo ID ${id}`);
      }
      tempMark.add(id);
      const deps = this.edges.get(id);
      if (deps) {
        for (const depId of deps) {
          visit(depId);
        }
      }
      tempMark.delete(id);
      visited.add(id);
      const item = this.nodes.get(id);
      if (item) result.unshift(item);
    };

    for (const id of this.nodes.keys()) {
      if (!visited.has(id)) {
        visit(id);
      }
    }

    return result;
  }

  /**
   * Devuelve los sucesores directos de un nodo (IDs que dependen de él).
   */
  getSuccessors(id: number): number[] {
    return Array.from(this.edges.get(id) || []);
  }

  /**
   * Devuelve los predecesores directos de un nodo (IDs de los que depende).
   */
  getPredecessors(id: number): number[] {
    return Array.from(this.reverseEdges.get(id) || []);
  }

  /**
   * Crea un grafo plano de dependencias a partir del proyecto.
   * Incluye solo tareas y hitos.
   */
  static fromProject(project: Project): DependencyGraph {
    const graph = new DependencyGraph();

    project.getAllItems().forEach((item: Item) => {
      if (item instanceof Task || item instanceof Milestone) {
        graph.addNode(item);
      }
    });

    graph.nodes.forEach((value: TNode) => {
      value.predecessors.forEach((prede: Item) => {
        if (graph.nodes.has(prede._id)) {
          graph.addEdge(prede._id, value._id);
        }
      });
    });

    return graph;
  }
}
