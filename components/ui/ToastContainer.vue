<template>
  <div 
    v-if="isEnabled" 
    class="toast-container position-fixed top-0 end-0 p-3" 
    style="z-index: 9999;"
  >
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :id="toast.id"
      :title="toast.title"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
      @close="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../../composables/useToast'

const { toasts, removeToast, isEnabled } = useToast()

const handleClose = (id: string) => {
  removeToast(id)
}


</script>

<style scoped>
.toast-container {
  max-width: 300px;
}

.toast-container .toast {
  margin-bottom: 0.25rem;
}
</style>