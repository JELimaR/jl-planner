import { ProjectController } from '../../src/controllers/ProjectController'
import type { IProjectData, IProjectHeader } from '../../src/models/Project'
import type { IItemData } from '../../src/models/Item'
import { createError, defineEventHandler, getQuery, readBody, setHeader } from 'h3';
import { displayStringToDate, TDateString } from '../../src/models/dateFunc';
import fs from 'node:fs';
import {join} from 'node:path'; 

// Singleton del controlador para mantener estado en el servidor
let projectController: ProjectController | null = null

function getController(): ProjectController {
  if (!projectController) {
    projectController = ProjectController.getInstance()
  }
  return projectController
}

export default defineEventHandler(async (event) => {
  const method = event.method
  const controller = getController()

  try {
    switch (method) {
      case 'GET': {
        const query = getQuery(event)
        
        if (query.type === 'header') {
          // Obtener solo el header del proyecto
          const headerData: IProjectHeader = controller.getHeaderData()
          return { success: true, data: headerData }
        } else if (query.type === 'download') {
          // Descargar proyecto como JSON
          const projectData: IProjectData = controller.getProjectData()
          setHeader(event, 'Content-Type', 'application/json')
          setHeader(event, 'Content-Disposition', `attachment; filename="${projectData.title || 'proyecto'}.jlprj"`)
          return projectData
        } else {
          // Obtener datos completos del proyecto
          const projectData: IProjectData = controller.getProjectData()
          return { success: true, data: projectData }
        }
      }

      case 'POST': {
        const body = await readBody(event)
        const { action, data } = body

        switch (action) {
          case 'initialize': {
            const { projectId } = data
            if (projectId) {
              // Cargar proyecto específico (implementar según necesidades)
              // Por ahora carga el proyecto de ejemplo
              controller.chargeExampleProject()
            } else {
              // Inicializar proyecto por defecto
              try {
                // Intentar cargar template00.jlprj
                const templatePath = './public/template00.jlprj'
                const fs = await import('fs/promises')
                const templateData = await fs.readFile(templatePath, 'utf-8')
                const jsonData = JSON.parse(templateData)
                controller.loadProjectFromJSON(jsonData)
              } catch (err) {
                console.warn('No se pudo cargar template00.jlprj:', err)
                controller.createNewProject(new Date())
                controller.chargeExampleProject()
              }
            }
            return { success: true, data: controller.getProjectData() }
          }

          case 'getTemplate': {
            const { tid } = data as { tid: string }
            let templatePath: string;

            switch (tid) {
              case 'p001':
                templatePath = './public/template-p001.jlprj';
                try {
                  const fs = await import('fs/promises');
                  const templateData = await fs.readFile(templatePath, 'utf-8');
                  const jsonData = JSON.parse(templateData);
                  return { success: true, data: jsonData };
                } catch (err) {
                  console.error('Error reading template file:', err);
                  throw createError({
                    statusCode: 500,
                    statusMessage: `Error loading template for ID '${tid}'.`
                  });
                }
              case 'p002':
                // Cargar proyecto de ejemplo
                controller.chargeExampleProject();
                return { success: true, data: controller.getProjectData() };
              case 'p003':
                // Crear un nuevo proyecto
                controller.createNewProject(new Date());
                return { success: true, data: controller.getProjectData() };
              default:
                controller.createNewProject(new Date());
                return { success: true, data: controller.getProjectData() };
                throw createError({
                  statusCode: 404,
                  statusMessage: `Template ID '${tid}' not found.`
                });
            }
          }

          case 'loadExample': {
            // Cargar proyecto de ejemplo
            controller.chargeExampleProject()
            return { success: true, data: controller.getProjectData() }
          }

          case 'newProject': {
            const { startDate } = data as {startDate: TDateString | undefined}
            controller.createNewProject(startDate ? displayStringToDate(startDate) : new Date())
            return { success: true, data: controller.getProjectData() }
          }

          case 'loadFromFile': {
            const { jsonData } = data
            controller.loadProjectFromJSON(jsonData)
            return { success: true, data: controller.getProjectData() }
          }

          case 'saveTitle': {
            const { title, subtitle } = data
            controller.saveTitle(title, subtitle)
            return { success: true, data: controller.getHeaderData() }
          }

          case 'changeStartDate': {
            const { startDate } = data as {startDate: TDateString}
            controller.changeStartDate(displayStringToDate(startDate))
            return { success: true, data: controller.getProjectData() }
          }

          case 'resetActualStartDates': {
            controller.resetActualStartDates()
            return { success: true, data: controller.getProjectData() }
          }

          case 'addItem': {
            const itemData: IItemData = data.itemData
            controller.addNewItem(itemData)
            return { success: true, data: controller.getProjectData() }
          }

          case 'editItem': {
            const { id, itemData } = data
            controller.editItem(id, itemData)
            return { success: true, data: controller.getProjectData() }
          }

          case 'deleteItem': {
            const { id } = data
            controller.deleteItem(id)
            return { success: true, data: controller.getProjectData() }
          }

          case 'changeOrder': {
            const { itemId, sense } = data
            const item = controller.getProject().getItemById(itemId)
            if (item) {
              controller.changeOrder(item, sense)
              return { success: true, data: controller.getProjectData() }
            }
            throw new Error(`Item with ID ${itemId} not found`)
          }

          case 'exportPDF': {
            // Placeholder para exportar PDF
            return { success: true, message: 'PDF export functionality to be implemented' }
          }

          default:
            throw new Error(`Unknown action: ${action}`)
        }
      }

      case 'PUT': {
        const body = await readBody(event)
        const projectData: IProjectData = body
        controller.loadProjectFromJSON(projectData)
        return { success: true, data: controller.getProjectData() }
      }

      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Method Not Allowed'
        })
    }
  } catch (error) {
    console.error('Project API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
    })
  }
})