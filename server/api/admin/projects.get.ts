import { defineEventHandler, createError } from 'h3'
import { ProjectModel } from '../../models/Project'
import { User } from '../../models/User'
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

    console.log('🔄 Admin obteniendo todos los proyectos...')
    
    // Obtener todos los proyectos (admin puede ver todos)
    const projects = await ProjectModel.find({})
      .select('title subtitle ownerId isPublic isTemplate createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(100) // Límite más alto para admins
    
    console.log('✅ Proyectos obtenidos para admin:', projects.length)
    
    // Obtener información de los propietarios
    const ownerIds = [...new Set(projects.map(p => p.ownerId))] // IDs únicos
    const owners = await User.find({ _id: { $in: ownerIds } })
      .select('_id username name surname')
    
    // Crear un mapa de propietarios para búsqueda rápida
    const ownersMap = new Map()
    owners.forEach(owner => {
      ownersMap.set(owner._id.toString(), {
        username: owner.username,
        name: owner.name,
        surname: owner.surname
      })
    })
    
    console.log('✅ Información de propietarios obtenida:', owners.length, 'usuarios')
    
    return {
      success: true,
      projects: projects.map(project => {
        const ownerInfo = ownersMap.get(project.ownerId) || {
          username: 'Desconocido',
          name: 'Usuario',
          surname: 'Eliminado'
        }
        
        return {
          id: project._id.toString(),
          title: project.title,
          subtitle: project.subtitle,
          ownerId: project.ownerId,
          owner: {
            username: ownerInfo.username,
            name: ownerInfo.name,
            surname: ownerInfo.surname,
            displayName: `${ownerInfo.name} ${ownerInfo.surname} (${ownerInfo.username})`
          },
          isPublic: project.isPublic,
          isTemplate: project.isTemplate,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }
      })
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error obteniendo proyectos para admin:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor'
    })
  }
})