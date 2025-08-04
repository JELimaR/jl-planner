import { defineEventHandler, getQuery, getRouterParam, readBody } from 'h3'

// Datos mock para usuarios
const mockUsers = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    role: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'María García',
    email: 'maria.garcia@example.com',
    role: 'user',
    createdAt: '2024-01-16T09:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z'
  },
  {
    id: 3,
    name: 'Carlos López',
    email: 'carlos.lopez@example.com',
    role: 'user',
    createdAt: '2024-01-17T14:15:00Z',
    updatedAt: '2024-01-17T14:15:00Z'
  }
]

export default defineEventHandler(async (event) => {
  const method = event.method
  const url = getRouterParam(event, 'id')
  
  try {
    switch (method) {
      case 'GET':
        if (url) {
          // Obtener usuario por ID
          const userId = parseInt(url)
          const user = mockUsers.find(u => u.id === userId)
          
          if (!user) {
            throw createError({
              statusCode: 404,
              statusMessage: 'Usuario no encontrado'
            })
          }
          
          return {
            success: true,
            data: user
          }
        } else {
          // Obtener todos los usuarios
          const query = getQuery(event) as { role?: string; search?: string }
          let filteredUsers = [...mockUsers]
          
          // Filtrar por rol si se especifica
          if (query.role) {
            filteredUsers = filteredUsers.filter(u => u.role === query.role)
          }
          
          // Filtrar por búsqueda si se especifica
          if (query.search) {
            const searchTerm = query.search.toString().toLowerCase()
            filteredUsers = filteredUsers.filter(u => 
              u.name.toLowerCase().includes(searchTerm) ||
              u.email.toLowerCase().includes(searchTerm)
            )
          }
          
          return {
            success: true,
            data: filteredUsers,
            total: filteredUsers.length
          }
        }
        
      case 'POST':
        // Crear nuevo usuario
        const body = await readBody(event)
        
        if (!body.name || !body.email) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Nombre y email son requeridos'
          })
        }
        
        // Verificar si el email ya existe
        const existingUser = mockUsers.find(u => u.email === body.email)
        if (existingUser) {
          throw createError({
            statusCode: 409,
            statusMessage: 'El email ya está en uso'
          })
        }
        
        const newUser = {
          id: Math.max(...mockUsers.map(u => u.id)) + 1,
          name: body.name,
          email: body.email,
          role: body.role || 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        mockUsers.push(newUser)
        
        return {
          success: true,
          data: newUser,
          message: 'Usuario creado exitosamente'
        }
        
      case 'PUT':
        // Actualizar usuario
        if (!url) {
          throw createError({
            statusCode: 400,
            statusMessage: 'ID de usuario requerido'
          })
        }
        
        const updateUserId = parseInt(url)
        const userIndex = mockUsers.findIndex(u => u.id === updateUserId)
        
        if (userIndex === -1) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Usuario no encontrado'
          })
        }
        
        const updateBody = await readBody(event)
        
        // Verificar si el nuevo email ya existe (si se está cambiando)
        if (updateBody.email && updateBody.email !== mockUsers[userIndex].email) {
          const emailExists = mockUsers.find(u => u.email === updateBody.email)
          if (emailExists) {
            throw createError({
              statusCode: 409,
              statusMessage: 'El email ya está en uso'
            })
          }
        }
        
        mockUsers[userIndex] = {
          ...mockUsers[userIndex],
          ...updateBody,
          updatedAt: new Date().toISOString()
        }
        
        return {
          success: true,
          data: mockUsers[userIndex],
          message: 'Usuario actualizado exitosamente'
        }
        
      case 'DELETE':
        // Eliminar usuario
        if (!url) {
          throw createError({
            statusCode: 400,
            statusMessage: 'ID de usuario requerido'
          })
        }
        
        const deleteUserId = parseInt(url)
        const deleteIndex = mockUsers.findIndex(u => u.id === deleteUserId)
        
        if (deleteIndex === -1) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Usuario no encontrado'
          })
        }
        
        const deletedUser = mockUsers.splice(deleteIndex, 1)[0]
        
        return {
          success: true,
          data: deletedUser,
          message: 'Usuario eliminado exitosamente'
        }
        
      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Método no permitido'
        })
    }
  } catch (error) {
    // Si es un error ya creado, lo relanzamos
    if (error.statusCode) {
      throw error
    }
    
    // Error genérico del servidor
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor',
      data: error.message
    })
  }
})