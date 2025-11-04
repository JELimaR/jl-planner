import mongoose from 'mongoose'
import type { IProjectData } from '../../src/models/Project'

// Interfaz para datos básicos del proyecto (sin criticalPaths calculados)
export interface IProjectBasicData {
  title: string
  subtitle: string
  startDate: string
  endDate: string
  items: any[]
}

// Interfaz que extiende los datos básicos con campos de base de datos
export interface IProjectDB extends IProjectBasicData {
  _id?: string
  ownerId: string // Usuario propietario del proyecto
  isPublic: boolean // Si es visible para todos
  isTemplate: boolean // Si es una plantilla
  createdAt: Date
  updatedAt: Date
}

// Schema de MongoDB
const projectSchema = new mongoose.Schema<IProjectDB>({
  // Campos de IProjectData (sin id personalizado, usar _id automático)
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    default: '',
    trim: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  items: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: []
  },

  // Campos adicionales para gestión
  ownerId: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
})

// Índices para optimizar consultas
projectSchema.index({ ownerId: 1, isTemplate: 1 })
projectSchema.index({ isPublic: 1, isTemplate: 1 })

export const ProjectModel = mongoose.models.Project || mongoose.model<IProjectDB>('Project', projectSchema)