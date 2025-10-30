import { verifyToken, type JWTPayload } from './jwt'

export function extractTokenFromHeaders(event: any): string | null {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader) return null
  
  // Formato: "Bearer <token>"
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }
  
  return parts[1]
}

export function requireAuth(event: any): JWTPayload {
  const token = extractTokenFromHeaders(event)
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token de autenticación requerido'
    })
  }
  
  const payload = verifyToken(token)
  
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token inválido o expirado'
    })
  }
  
  return payload
}

export function requireAdmin(event: any): JWTPayload {
  const payload = requireAuth(event)
  
  if (payload.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado. Se requieren permisos de administrador'
    })
  }
  
  return payload
}