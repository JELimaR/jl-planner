import mongoose from 'mongoose'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Usar cache global para evitar múltiples conexiones en desarrollo
declare global {
  var mongoose: MongooseCache | undefined
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Por favor define la variable MONGODB_URI en el archivo .env')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ Conectado a MongoDB Atlas')
      return mongoose
    }).catch((error) => {
      console.error('❌ Error conectando a MongoDB:', error)
      throw error
    })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    throw e
  }

  return cached!.conn
}