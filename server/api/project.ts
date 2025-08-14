import { ProjectController, SpendingMethod } from '../../src/controllers/ProjectController'
import type { IProjectData, IProjectHeader } from '../../src/models/Project'
import type { IItemData } from '../../src/models/Item'
import { createError, defineEventHandler, getQuery, readBody, setHeader } from 'h3';
import { displayStringToDate, type TDateString } from '../../src/models/dateFunc';
import { TTemplateID } from '../../src/templates/templateProjects';

// Singleton del controlador para mantener estado en el servidor
let projectController: ProjectController | null = null

function getController(): ProjectController {
  projectController ??= ProjectController.getInstance();
  return projectController
}

export default defineEventHandler(async (event) => {
  const method = event.method
  const controller = getController()

  try {
    switch (method) {
      case 'GET': {
        const query = getQuery(event)
        
        if (query.type === 'headers') {
          // Obtener solo el header del proyecto
          const headerData: IProjectHeader[] = controller.getAllTemplatesHeaders()
          return { success: true, data: headerData }
        } else if (query.type === 'download') {
          // Descargar proyecto como JSON
          const projectData: IProjectData = controller.getProjectData()
          setHeader(event, 'Content-Type', 'application/json')
          setHeader(event, 'Content-Disposition', `attachment; filename="${projectData.title || 'proyecto'}.prj"`)
          return { success: true, data: projectData }
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

          case 'getTemplateHeaders': {
            const headerData: IProjectHeader[] = controller.getAllTemplatesHeaders()
            return { success: true, data: headerData }
          }
          
          case 'getTemplate': {
            const { tid } = data as { tid: TTemplateID }
            controller.chargeTemplate(tid)
            return { success: true, data: controller.getProjectData() };
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

          case 'getDailySpending': {
            const { spendingMethod } = data as { spendingMethod: SpendingMethod };
            const dailySpending = controller.calculateDailySpending(spendingMethod);
            return { success: true, data: dailySpending };
          }

          case 'exportPDF': {
            // Placeholder para exportar PDF
            return { success: true, message: 'PDF export functionality to be implemented' }
          }

          default:
            throw new Error(`Unknown action: ${action}`)
        }
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