import { defineEventHandler, getRouterParam, readBody } from 'h3'
// Este archivo maneja las rutas /api/users/[id]
// La lógica principal está en users.ts, este archivo es para compatibilidad de rutas

export default defineEventHandler(async (event) => {
  // Redirigir a la API principal de users
  const id = getRouterParam(event, 'id')
  const method = event.method
  
  // Reenviar la petición a la API principal
  return $fetch(`/api/users`, {
    method,
    body: method !== 'GET' ? await readBody(event) : undefined,
    query: { id }
  })
})