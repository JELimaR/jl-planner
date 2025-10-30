import { connectToDatabase } from '../../utils/mongodb'
import { User } from '../../models/User'

interface DeleteUserRequest {
  username: string
}

// @ts-ignore - defineEventHandler es una función global de Nitro
export default defineEventHandler(async (event) => {
  try {
    // Conectar a la base de datos
    await connectToDatabase()

    // @ts-ignore - readBody es una función global de Nitro
    const body = await readBody<DeleteUserRequest>(event)
    const { username } = body

    // Proteger al admin principal
    if (username === 'UT603324') {
      return {
        success: false,
        error: 'No se puede eliminar al administrador principal'
      }
    }

    // Validar formato de usuario
    const userPattern = /^(UT\d{6}|[A-Z]\d{6})$/
    if (!userPattern.test(username)) {
      return {
        success: false,
        error: 'Formato de usuario inválido'
      }
    }

    // Buscar y eliminar usuario
    const deletedUser = await User.findOneAndDelete({ username })

    if (!deletedUser) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      }
    }

    return {
      success: true,
      message: `Usuario ${username} eliminado exitosamente`
    }
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
})