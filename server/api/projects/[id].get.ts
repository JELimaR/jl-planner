import { defineEventHandler, createError, getRouterParam } from 'h3'
import { ProjectModel } from '../../models/Project'
import { connectToDatabase } from '../../utils/mongodb'
import { Project } from '../../../src/models/Project'

export default defineEventHandler(async (event) => {
  try {
    // Conectar a la base de datos
    await connectToDatabase()
    
    const projectId = getRouterParam(event, 'id')
    
    if (!projectId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID del proyecto requerido'
      })
    }
    
    // Buscar el proyecto por _id de MongoDB
    const project = await ProjectModel.findById(projectId)
    
    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Proyecto no encontrado'
      })
    }
    
    // Crear instancia de Project para calcular criticalPaths
    console.log('🔄 Calculando criticalPaths para proyecto:', project.title)
    
    try {
      // Crear datos del proyecto para la clase Project
      const projectData = {
        id: project._id.toString(),
        title: project.title,
        subtitle: project.subtitle,
        startDate: project.startDate,
        endDate: project.endDate,
        items: project.items,
        criticalPaths: [] // Se calculará dinámicamente
      }
      
      // Crear instancia de Project y calcular criticalPaths
      const projectInstance = Project.deserializeProject(projectData)
      const calculatedData = projectInstance.getData()
      
      console.log('✅ CriticalPaths calculados:', calculatedData.criticalPaths.length, 'caminos')
      
      // Devolver el proyecto completo con criticalPaths calculados
      return {
        project: {
          id: project._id.toString(), // Usar _id como id principal
          _id: project._id.toString(),
          title: project.title,
          subtitle: project.subtitle,
          startDate: project.startDate,
          endDate: project.endDate,
          items: project.items,
          criticalPaths: calculatedData.criticalPaths, // Calculados dinámicamente
          ownerId: project.ownerId,
          isPublic: project.isPublic,
          isTemplate: project.isTemplate,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }
      }
    } catch (calculationError) {
      console.error('❌ Error calculando criticalPaths:', calculationError)
      
      // Si falla el cálculo, devolver sin criticalPaths
      return {
        project: {
          id: project._id.toString(), // Usar _id como id principal
          _id: project._id.toString(),
          title: project.title,
          subtitle: project.subtitle,
          startDate: project.startDate,
          endDate: project.endDate,
          items: project.items,
          criticalPaths: [], // Array vacío si falla el cálculo
          ownerId: project.ownerId,
          isPublic: project.isPublic,
          isTemplate: project.isTemplate,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }
      }
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error al obtener proyecto:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor'
    })
  }
})