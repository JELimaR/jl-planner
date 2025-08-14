import { IProjectHeader, Project } from './models/Project';
const templates: Map<string, Project> = new Map<string, Project>();

export function getTemplateProject(tid: string): Project {
  let project = templates.get(tid)
  if (!project) {
    switch (tid) {
      
    
      default:
        project = new Project('n', new Date())
        break;
    }
  }
  return project;
}

export function getAllTemplateProjectHeaders(): IProjectHeader[] {
  const headers: IProjectHeader[] = [];
  templates.forEach((P: Project) => headers.push(P.getHeaderData()))
  return headers;
}