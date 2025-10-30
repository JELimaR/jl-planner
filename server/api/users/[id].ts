// @ts-ignore - Funciones globales de Nitro
import { defineEventHandler, getRouterParam, readBody } from 'h3'
// Este archivo maneja las rutas /api/users/[id]
// La lógica principal está en users.ts, este archivo es para compatibilidad de rutas

// @ts-ignore - defineEventHandler es una función global de Nitro
export default defineEventHandler(async (event) => {
  // Redirigir a la API principal de users
  // @ts-ignore - getRouterParam es una función global de Nitro
  const id = getRouterParam(event, 'id')
  const method = event.method
  
  // Reenviar la petición a la API principal
  return $fetch(`/api/users`, {
    method,
    // @ts-ignore - readBody es una función global de Nitro
    body: method !== 'GET' ? await readBody(event) : undefined,
    query: { id }
  })
})