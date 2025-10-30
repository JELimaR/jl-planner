import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '60m'

export interface JWTPayload {
  userId: string
  username: string
  name: string
  surname: string
  role: 'admin' | 'user'
  iat?: number
  exp?: number
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Error verificando token:', error.message)
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    if (!decoded || !decoded.exp) return true
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

export function getTokenExpirationTime(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    if (!decoded || !decoded.exp) return null
    
    return new Date(decoded.exp * 1000)
  } catch (error) {
    return null
  }
}