import { connectToDatabase } from '../../utils/mongodb'
import { User } from '../../models/User'

interface CreateUserRequest {
  username: string
  name: string
  surname: string
  password: string
  role: 'admin' | 'user'
}

// @ts-ignore - defineEventHandler es una función global de Nitro
export default defineEventHandler(async (event) => {
  try {
    // Conectar a la base de datos
    await connectToDatabase()

    // @ts-ignore - readBody es una función global de Nitro
    const body = await readBody<CreateUserRequest>(event)
    const { username, name, surname, password, role } = body

    // Validar formato de usuario
    const userPattern = /^(UT\d{6}|[A-Z]\d{6})$/
    if (!userPattern.test(username)) {
      return {
        success: false,
        error: 'Formato de usuario inválido. Debe ser UT + 6 dígitos o 1 letra + 6 números'
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

    if (!password || password.length < 4) {
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

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return {
        success: false,
        error: 'El usuario ya existe'
      }
    }

    // Crear nuevo usuario (la contraseña se hashea automáticamente)
    const newUser = new User({
      username,
      name: name.trim(),
      surname: surname.trim(),
      password,
      role
    })

    await newUser.save()

    return {
      success: true,
      message: `Usuario ${username} creado exitosamente`,
      user: newUser.toPublicJSON()
    }
  } catch (error) {
    console.error('Error creando usuario:', error)
    
    // Manejar errores de validación de Mongoose
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