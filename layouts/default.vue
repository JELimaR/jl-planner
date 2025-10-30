<template>
  <div class="app-layout">
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <NuxtLink to="/" class="navbar-brand">
          <i class="bi bi-house"></i> Home
        </NuxtLink>
        <div class="navbar-nav ms-auto">
          <!--<NuxtLink to="/" class="nav-link">Inicio</NuxtLink>-->
          <!--<NuxtLink to="/project" class="nav-link">Proyecto</NuxtLink>-->
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Toast Container -->
    <ToastContainer />

    <!-- Footer -->
    <footer class="footer bg-light mt-auto py-3">
      <div class="container text-center">
        <span class="text-muted">© 2024 Planner - Gestión</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Layout básico sin lógica específica de proyecto
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.footer {
  margin-top: auto;
}
</style>
