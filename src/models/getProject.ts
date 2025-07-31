import { Milestone } from './Milestone';
import { Process } from './Process';
import { Project } from './Project';
import { Task } from './Task';

export function getProject(): Project {
  const project = new Project(new Date('2025-09-01'));

  const p1 = new Process(1, 'Planificación');
  project.addItem(p1);
  const t11 = new Task(11, 'Diseño', 5);
  project.addItem(t11, p1);
  const t12 = new Task(12, 'Presupuestación', 3);
  project.addItem(t12, p1);

  const p2 = new Process(2, 'Desarrollo');
  project.addItem(p2);
  project.addRelation(t11, p2);

  const t21 = new Task(21, 'Preparación', 7);
  project.addItem(t21, p2);
  const t22 = new Task(22, 'Ejecución', 18);
  project.addItem(t22, p2);
  const p23 = new Process(23, 'subProcess');
  project.addItem(p23, p2);
  project.addRelation(t21, p23);
  project.addRelation(t22, p23);
  const m231 = new Milestone(231, 'LISTO');
  project.addItem(m231, p23);

  const t3 = new Task(3, 'Pruebas', 2);
  project.addItem(t3);
  project.addRelation(m231, t3);

  return project;
}
