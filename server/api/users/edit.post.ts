import { connectToDatabase } from '../../utils/mongodb'
import { User } from '../../models/User'

interface EditUserRequest {
  username: string
  name: string
  surname: string
  password?: string
  role: 'admin' | 'user'
}

// @ts-ignore - defineEventHandler es una función global de Nitro
export default defineEventHandler(async (event) => {
  try {
    // Conectar a la base de datos
    await connectToDatabase()

    // @ts-ignore - readBody es una función global de Nitro
    const body = await readBody<EditUserRequest>(event)
    const { username, name, surname, password, role } = body

    // Validar formato de usuario
    const userPattern = /^(UT\d{6}|[A-Z]\d{6})$/
    if (!userPattern.test(username)) {
      return {
        success: false,
        error: 'Formato de usuario inválido'
      }
    }

    // Validar campos requeridos
    if (!name || name.trim().length < 2) {
      return {
        success: false,
        error: 'El nombre debe tener al menos 2 caracteres'
      }
    }

    if (!surname || surname.trim().length < 2) {
      return {
        success: false,
        error: 'El apellido debe tener al menos 2 caracteres'
      }
    }

    if (password && password.length < 4) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 4 caracteres'
      }
    }

    if (!['admin', 'user'].includes(role)) {
      return {
        success: false,
        error: 'El rol debe ser admin o user'
      }
    }

    // Buscar usuario
    const user = await User.findOne({ username })
    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      }
    }

    // Actualizar campos
    user.name = name.trim()
    user.surname = surname.trim()
    user.role = role

    // Solo actualizar contraseña si se proporciona una nueva
    if (password) {
      user.password = password // Se hashea automáticamente por el middleware
    }

    await user.save()

    return {
      success: true,
      message: `Usuario ${username} actualizado exitosamente`,
      user: user.toPublicJSON()
    }
  } catch (error) {
    console.error('Error editando usuario:', error)
    
    if (error.name === 'ValidationError') {
      return {
        success: false,
        error: 'Datos de usuario inválidos'
      }
    }

    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
})