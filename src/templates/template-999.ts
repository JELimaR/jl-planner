import { Milestone } from '../models/Milestone';
import { Process } from '../models/Process';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { TDateString, displayStringToDate } from '../models/dateFunc';

export function getTemplate999(): Project {
  const project = new Project('t999', displayStringToDate('01-09-2025' as TDateString));

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

  const t3 = new Task(3, 'Pruebas', 3);
  project.addItem(t3);
  project.addRelation(m231, t3);

  /****************************************************************** */
  t21.setActualStartDate(displayStringToDate('29-08-2025' as TDateString));
  t3.setActualStartDate(displayStringToDate('29-09-2025' as TDateString));
  project.getCriticalPaths();

  project.setTitle('Example')
  project.setSubtitle('Example subtitle')

  return project;
}
