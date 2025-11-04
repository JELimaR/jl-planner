import jwt from 'jsonwebtoken'
import { getCookie, getHeader } from 'h3'
import type { H3Event } from 'h3'

interface JWTPayload {
  userId: string
  username: string
  name: string
  surname: string
  role: 'admin' | 'user'
  iat?: number
  exp?: number
}

export async function verifyToken(event: H3Event): Promise<JWTPayload | null> {
  try {
    // Intentar obtener el token del header Authorization
    let token = getHeader(event, 'authorization')
    
    console.log('🔍 Headers recibidos:', Object.fromEntries(
      Object.entries(event.node.req.headers).filter(([key]) => 
        key.toLowerCase().includes('auth') || key.toLowerCase().includes('bearer')
      )
    ))
    
    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7)
      console.log('✅ Token extraído del header Authorization')
    } else {
      // Si no hay header, intentar obtener de las cookies
      token = getCookie(event, 'auth-token')
      if (token) {
        console.log('✅ Token extraído de cookies')
      }
    }
    
    if (!token) {
      console.log('❌ No se encontró token en headers ni cookies')
      return null
    }
    
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    
    console.log('✅ Token verificado exitosamente para usuario:', decoded.username)
    return decoded
  } catch (error) {
    console.error('❌ Error verifying token:', error)
    return null
  }
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '60m'
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}