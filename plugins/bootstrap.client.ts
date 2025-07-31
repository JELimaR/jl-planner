import { Modal } from 'bootstrap'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      bootstrap: {
        Modal
      }
    }
  }
})