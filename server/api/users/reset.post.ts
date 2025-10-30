import { connectToDatabase } from '../../utils/mongodb'
import { User } from '../../models/User'

// @ts-ignore - defineEventHandler es una función global de Nitro
export default defineEventHandler(async (event) => {
  try {
    // Conectar a la base de datos
    await connectToDatabase()

    // Eliminar todos los usuarios excepto el admin principal
    const result = await User.deleteMany({ 
      username: { $ne: 'UT603324' } // $ne = "not equal"
    })

    return {
      success: true,
      message: `Se eliminaron ${result.deletedCount} usuarios. El administrador principal se mantuvo.`,
      deletedCount: result.deletedCount
    }
  } catch (error) {
    console.error('Error reseteando usuarios:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
})