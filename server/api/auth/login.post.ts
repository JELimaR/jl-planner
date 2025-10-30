import { connectToDatabase } from '../../utils/mongodb'
import { User } from '../../models/User'
import { generateToken } from '../../utils/jwt'

interface LoginRequest {
  username: string
  password: string
}

// @ts-ignore - defineEventHandler es una función global de Nitro
export default defineEventHandler(async (event) => {
  try {
    // Conectar a la base de datos
    await connectToDatabase()

    // @ts-ignore - readBody es una función global de Nitro
    const body = await readBody<LoginRequest>(event)
    const { username, password } = body

    // Validar formato de usuario
    const userPattern = /^(UT\d{6}|[A-Z]\d{6})$/
    if (!userPattern.test(username)) {
      return {
        success: false,
        error: 'Formato de usuario inválido'
      }
    }

    // Buscar usuario en la base de datos
    const user = await User.findOne({ username })

    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      }
    }

    // Verificar contraseña usando el método del modelo
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Contraseña incorrecta'
      }
    }

    // Generar token JWT
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      name: user.name,
      surname: user.surname,
      role: user.role
    })

    // Retornar datos públicos del usuario y token
    return {
      success: true,
      user: user.toPublicJSON(),
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '60m'
    }
  } catch (error) {
    console.error('Error en login API:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
})