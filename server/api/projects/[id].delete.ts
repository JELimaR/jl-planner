import { defineEventHandler, createError, getRouterParam } from 'h3'
import { ProjectModel } from '../../models/Project'
import { verifyToken } from '../../../server/utils/auth'
import { connectToDatabase } from '../../utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    // Conectar a la base de datos
    await connectToDatabase()
    
    // Verificar autenticación
    const user = await verifyToken(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No autorizado'
      })
    }

    const projectId = getRouterParam(event, 'id')
    
    if (!projectId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID del proyecto requerido'
      })
    }
    
    console.log('🗑️ Eliminando proyecto:', projectId, 'Usuario:', user.username)
    
    // Buscar el proyecto por _id de MongoDB
    const project = await ProjectModel.findById(projectId)
    
    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Proyecto no encontrado'
      })
    }
    
    // Verificar permisos: propietario o administrador
    const isOwner = project.ownerId === user.userId
    const isAdmin = user.role === 'admin'
    
    if (!isOwner && !isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No tienes permisos para eliminar este proyecto'
      })
    }
    
    // Log especial para administradores que eliminan proyectos ajenos
    if (isAdmin && !isOwner) {
      console.log('⚠️ ADMIN DELETE: Usuario', user.username, 'eliminando proyecto de', project.ownerId)
    }
    
    // Eliminar el proyecto
    await ProjectModel.findByIdAndDelete(projectId)
    
    console.log('✅ Proyecto eliminado:', project.title)
    
    return {
      success: true,
      message: isAdmin && !isOwner 
        ? 'Proyecto eliminado correctamente (como administrador)'
        : 'Proyecto eliminado correctamente',
      project: {
        id: project._id.toString(),
        title: project.title,
        ownerId: project.ownerId
      }
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error al eliminar proyecto:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor'
    })
  }
})