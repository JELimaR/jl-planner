import { Project, type IProjectHeader } from '../models/Project';
import { getTemplate001 } from './template-001';
import { getTemplate999 } from './template-999';

export type TTemplateID =
  | 't000'
  | 't001'
  | 't999';
const templates: Map<TTemplateID, Project> = new Map<TTemplateID, Project>();

function createAllTemplates() {
  // 000
  const empty = new Project('t000', new Date());
  empty.setTitle('Blank project')
  templates.set('t000', empty)
  // 001
  const t001 = getTemplate001()
  templates.set('t001', t001)

  // 999
  const t999 = getTemplate999()
  templates.set('t999', t999)
}

function getTemplates() {
  if (templates.size == 0) {
    createAllTemplates()
  }
  return templates;
}

export function getTemplateProject(tid: TTemplateID): Project {
  let project = getTemplates().get(tid)
  if (!project) {
    project = new Project('n', new Date())
  }
  return project;
}

export function getAllTemplateProjectHeaders(): IProjectHeader[] {
  const headers: IProjectHeader[] = [];
  getTemplates().forEach((P: Project) => headers.push(P.getHeaderData()))
  return headers;
}