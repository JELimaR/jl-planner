import { connectToDatabase } from '../../utils/mongodb'
import { User } from '../../models/User'

// @ts-ignore - defineEventHandler es una función global de Nitro
export default defineEventHandler(async (event) => {
  try {
    // Conectar a la base de datos
    await connectToDatabase()

    // Obtener todos los usuarios (sin contraseñas) ordenados por fecha de creación
    const users = await User.find({}, '-password').sort({ createdAt: -1 })

    // Convertir a formato público
    const publicUsers = users.map(user => user.toPublicJSON())

    return {
      success: true,
      users: publicUsers
    }
  } catch (error) {
    console.error('Error listando usuarios:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
})