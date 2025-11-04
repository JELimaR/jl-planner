import { defineEventHandler, createError, getQuery } from 'h3'
import { ProjectModel } from '../../models/Project'
import { verifyToken } from '../../../server/utils/auth'
import { connectToDatabase } from '../../utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    // Conectar a la base de datos
    await connectToDatabase()
    
    const query = getQuery(event)
    
    // Si se solicitan proyectos públicos o plantillas, no requiere autenticación
    if (query.public === 'true' || query.templates === 'true') {
      const filter: any = {}
      
      if (query.public === 'true') {
        filter.isPublic = true
      }
      
      if (query.templates === 'true') {
        filter.isTemplate = true
      }
      
      const projects = await ProjectModel.find(filter)
        .select('title subtitle ownerId isPublic isTemplate createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(50)
      
      return {
        success: true,
        projects: projects.map(project => ({
          id: project._id.toString(),
          title: project.title,
          subtitle: project.subtitle,
          ownerId: project.ownerId,
          isPublic: project.isPublic,
          isTemplate: project.isTemplate,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }))
      }
    }
    
    // Para proyectos privados, verificar autenticación
    const user = await verifyToken(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No autorizado'
      })
    }
    
    // Obtener proyectos del usuario
    const projects = await ProjectModel.find({ ownerId: user.userId })
      .select('title subtitle ownerId isPublic isTemplate createdAt updatedAt')
      .sort({ updatedAt: -1 })
    
    return {
      success: true,
      projects: projects.map(project => ({
        id: project._id.toString(),
        title: project.title,
        subtitle: project.subtitle,
        ownerId: project.ownerId,
        isPublic: project.isPublic,
        isTemplate: project.isTemplate,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }))
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error al obtener proyectos:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor'
    })
  }
})