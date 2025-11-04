import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
  username: string
  name: string
  surname: string
  password: string
  role: 'admin' | 'user'
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^(UT\d{6}|[A-Z]\d{6})$/,
    maxlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  surname: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 4
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
})

// Middleware para hashear contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified('password')) return next()
  
  try {
    // Hashear contraseña
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Método para obtener datos públicos (sin contraseña)
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id.toString(),
    username: this.username,
    name: this.name,
    surname: this.surname,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)