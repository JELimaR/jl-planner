// Script para crear usuario admin inicial en MongoDB
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Cargar variables de entorno desde .env
async function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env')
    const envContent = await readFile(envPath, 'utf-8')
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=')
          process.env[key] = value
        }
      }
    })
  } catch (error) {
    console.error('❌ Error leyendo archivo .env:', error.message)
  }
}

// Cargar .env antes de continuar
await loadEnv()

// Configuración
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ Por favor configura MONGODB_URI en .env')
  console.error('   Formato: MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/jl-planner')
  process.exit(1)
}

if (MONGODB_URI.includes('[username]') || MONGODB_URI.includes('[password]')) {
  console.error('❌ Por favor reemplaza [username] y [password] con credenciales reales en .env')
  process.exit(1)
}

// Schema del usuario
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

async function createAdmin() {
  try {
    console.log('🔄 Conectando a MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Conectado a MongoDB')

    // Verificar si el admin ya existe
    const existingAdmin = await User.findOne({ username: 'UT603324' })
    if (existingAdmin) {
      console.log('⚠️  El usuario admin UT603324 ya existe')
      return
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash('UT603324', salt)

    // Crear usuario admin
    const adminUser = new User({
      username: 'UT603324',
      name: 'Administrador',
      surname: 'del Sistema',
      password: hashedPassword,
      role: 'admin'
    })

    await adminUser.save()
    console.log('✅ Usuario admin creado exitosamente!')
    console.log('   Usuario: UT603324')
    console.log('   Contraseña: UT603324')
    console.log('   Rol: admin')

  } catch (error) {
    console.error('❌ Error creando admin:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Desconectado de MongoDB')
  }
}

// Ejecutar
createAdmin()