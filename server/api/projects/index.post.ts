import { defineEventHandler, createError, readBody } from 'h3'
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

    const body = await readBody(event)
    const { projectData, isPublic = false, isTemplate = false } = body

    console.log('📝 Guardando proyecto:', projectData?.title, 'Usuario:', user.username)

    if (!projectData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Datos del proyecto requeridos'
      })
    }

    // Validar que el proyecto tenga título
    if (!projectData.title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Título del proyecto requerido'
      })
    }

    // Verificar si es una actualización (tiene id de MongoDB válido)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(projectData.id || '')
    if (isMongoId && projectData.id) {
      console.log('🔄 Actualizando proyecto existente:', projectData.title)
      
      // Buscar proyecto por _id
      const existingProject = await ProjectModel.findById(projectData.id)
      
      if (!existingProject) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Proyecto no encontrado'
        })
      }
      
      // Verificar permisos: propietario o administrador
      const isOwner = existingProject.ownerId === user.userId
      const isAdmin = user.role === 'admin'
      
      if (!isOwner && !isAdmin) {
        throw createError({
          statusCode: 403,
          statusMessage: 'No tienes permisos para modificar este proyecto'
        })
      }
      
      // Log especial para administradores que modifican proyectos ajenos
      if (isAdmin && !isOwner) {
        console.log('⚠️ ADMIN OVERRIDE: Usuario', user.username, 'modificando proyecto de', existingProject.ownerId)
      }
      
      // Actualizar proyecto existente (sin criticalPaths)
      const { criticalPaths, ...projectDataWithoutCalculated } = projectData
      
      // Mantener el propietario original, no cambiar el ownerId
      const updateData = {
        ...projectDataWithoutCalculated,
        ownerId: existingProject.ownerId, // Mantener propietario original
        isPublic,
        isTemplate
      }
      
      const updatedProject = await ProjectModel.findByIdAndUpdate(
        projectData.id,
        updateData,
        { new: true }
      )
      
      console.log('✅ Proyecto actualizado:', updatedProject?.title)
      
      // Mensaje diferente para administradores
      const message = isAdmin && !isOwner 
        ? 'Proyecto actualizado correctamente (como administrador)'
        : 'Proyecto actualizado correctamente'
      
      return {
        success: true,
        message,
        project: {
          id: updatedProject._id.toString(),
          title: updatedProject.title,
          subtitle: updatedProject.subtitle,
          ownerId: updatedProject.ownerId,
          isPublic: updatedProject.isPublic,
          isTemplate: updatedProject.isTemplate,
          createdAt: updatedProject.createdAt,
          updatedAt: updatedProject.updatedAt
        }
      }
    } else {
      // Crear nuevo proyecto (sin criticalPaths, el id se generará automáticamente)
      console.log('🆕 Creando nuevo proyecto:', projectData.title)
      
      const { id, criticalPaths, ...projectDataWithoutCalculated } = projectData
      const newProject = new ProjectModel({
        ...projectDataWithoutCalculated,
        ownerId: user.userId,
        isPublic,
        isTemplate
      })
      
      const savedProject = await newProject.save()
      console.log('✅ Proyecto guardado:', savedProject.title)
      
      return {
        success: true,
        message: 'Proyecto guardado correctamente',
        project: {
          id: savedProject._id.toString(),
          title: savedProject.title,
          subtitle: savedProject.subtitle,
          ownerId: savedProject.ownerId,
          isPublic: savedProject.isPublic,
          isTemplate: savedProject.isTemplate,
          createdAt: savedProject.createdAt,
          updatedAt: savedProject.updatedAt
        }
      }
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error al guardar proyecto:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor'
    })
  }
})