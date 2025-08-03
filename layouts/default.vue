<template>
  <div class="app-layout">
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <NuxtLink to="/" class="navbar-brand">
          <i class="bi bi-house"></i> JL Planner
        </NuxtLink>
        <div class="navbar-nav ms-auto">
          <NuxtLink to="/" class="nav-link">Inicio</NuxtLink>
          <NuxtLink to="/project" class="nav-link">Proyecto</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer bg-light mt-auto py-3">
      <div class="container text-center">
        <span class="text-muted">© 2024 JL Planner - Gestión de Proyectos</span>
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
