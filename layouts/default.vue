<template>
  <div class="app-layout">
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <NuxtLink to="/" class="navbar-brand">
          <i class="bi bi-house"></i> Planner
        </NuxtLink>

        <!-- Botón para colapsar en móvil -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <!-- Enlaces principales -->
          <ul class="navbar-nav me-auto">
            <li class="nav-item" v-if="authStore.isAuthenticated">
              <NuxtLink to="/projects" class="nav-link">
                <i class="bi bi-folder me-1"></i>Mis Proyectos
              </NuxtLink>
            </li>
          </ul>

          <!-- Enlaces de usuario -->
          <ul class="navbar-nav">
            <!-- Documentación -->
            <li class="nav-item">
              <NuxtLink to="/info" class="nav-link">
                <i class="bi bi-book me-1"></i>Doc
              </NuxtLink>
            </li>

            <!-- Enlace de admin (solo para admins) -->
            <li class="nav-item" v-if="authStore.isAuthenticated && authStore.user?.role === 'admin'">
              <NuxtLink to="/admin" class="nav-link text-danger">
                <i class="bi bi-gear me-1"></i>Admin
              </NuxtLink>
            </li>

            <!-- Usuario autenticado -->
            <li class="nav-item dropdown" v-if="authStore.isAuthenticated">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-1"></i>{{ authStore.user?.name }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <span class="dropdown-item-text">
                    <small class="text-muted">{{ authStore.user?.username }}</small><br>
                    <span class="badge" :class="authStore.user?.role === 'admin' ? 'bg-danger' : 'bg-primary'">
                      {{ authStore.user?.role === 'admin' ? 'Administrador' : 'Usuario' }}
                    </span>
                  </span>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li>
                  <button class="dropdown-item" @click="logout">
                    <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                  </button>
                </li>
              </ul>
            </li>

            <!-- Usuario no autenticado -->
            <li class="nav-item" v-else>
              <NuxtLink to="/login" class="nav-link">
                <i class="bi bi-box-arrow-in-right me-1"></i>Iniciar Sesión
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Toast Container -->
    <ToastContainer />

    <!-- Confirm Modal -->
    <ConfirmModal />

    <!-- Footer -->
    <footer class="footer bg-light mt-auto py-3">
      <div class="container text-center">
        <span class="text-muted">© 2024 Planner - Gestión</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { navigateTo } from 'nuxt/app'

// Layout básico sin lógica específica de proyecto
const authStore = useAuthStore()

// Restaurar sesión al cargar la aplicación
onMounted(() => {
  authStore.restoreSession()
})

// Función para cerrar sesión
const logout = () => {
  authStore.logout()
  navigateTo('/')
}
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
