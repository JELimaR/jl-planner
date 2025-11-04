import { Modal } from 'bootstrap'

// @ts-ignore
export default defineNuxtPlugin(() => {
  return {
    provide: {
      bootstrap: {
        Modal
      }
    }
  }
})