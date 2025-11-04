import { defineEventHandler, createError, readBody } from 'h3'
import { ProjectModel } from '../../models/Project'
import { verifyToken } from '../../utils/auth'
import { connectToDatabase } from '../../utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    // Conectar a la base de datos
    await connectToDatabase()
    
    // Verificar autenticación y que sea admin
    const user = await verifyToken(event)
    if (!user || user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Solo administradores pueden ejecutar esta acción'
      })
    }

    const body = await readBody(event)
    const { projectId, isPublic } = body

    if (!projectId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID del proyecto requerido'
      })
    }

    console.log('🔄 Cambiando estado público del proyecto:', projectId, 'a:', isPublic)
    
    // Buscar y actualizar el proyecto
    const updatedProject = await ProjectModel.findByIdAndUpdate(
      projectId,
      { isPublic: Boolean(isPublic) },
      { new: true }
    )
    
    if (!updatedProject) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Proyecto no encontrado'
      })
    }
    
    console.log('✅ Estado público actualizado:', updatedProject.title, '- Público:', updatedProject.isPublic)
    
    return {
      success: true,
      message: `Proyecto ${updatedProject.isPublic ? 'marcado como público' : 'marcado como privado'}`,
      project: {
        id: updatedProject._id.toString(),
        title: updatedProject.title,
        isPublic: updatedProject.isPublic,
        isTemplate: updatedProject.isTemplate,
        ownerId: updatedProject.ownerId
      }
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error cambiando estado público:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor'
    })
  }
})