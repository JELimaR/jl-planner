<template>
  <div class="container my-4">
    <div class="admin-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="h3 mb-1">
            <i class="bi bi-gear-fill text-primary"></i>
            Panel de Administración
          </h1>
          <p class="text-muted mb-0">
            Bienvenido, {{ authStore.user ? `${authStore.user.name} ${authStore.user.surname}` : authStore.currentUser
            }}
          </p>
          <small class="text-muted">
            <i class="bi bi-clock"></i>
            Sesión expira: {{ formatTokenExpiration() }}
          </small>
        </div>
        <button @click="handleLogout" class="btn btn-outline-danger">
          <i class="bi bi-box-arrow-right"></i>
          Cerrar Sesión
        </button>
      </div>
    </div>

    <div class="row">
      <!-- Estadísticas -->
      <div class="col-md-12 mb-4">
        <div class="row">
          <div class="col-md-3 mb-3">
            <div class="card bg-primary text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Usuarios Totales</h6>
                    <h3 class="mb-0">{{ stats.totalUsers }}</h3>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-people fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="card bg-success text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Administradores</h6>
                    <h3 class="mb-0">{{ stats.adminUsers }}</h3>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-shield-check fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="card bg-info text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Proyectos</h6>
                    <h3 class="mb-0">{{ stats.totalProjects }}</h3>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-folder fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="card bg-warning text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title">Sistema</h6>
                    <h3 class="mb-0">
                      <i class="bi bi-check-circle"></i>
                    </h3>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-cpu fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="bi bi-lightning-charge"></i>
              Acciones Rápidas
            </h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button class="btn btn-outline-primary" @click="goToProject">
                <i class="bi bi-folder-plus"></i>
                Ir a Proyectos
              </button>
              <button class="btn btn-outline-success" @click="showCreateUserModal = true">
                <i class="bi bi-person-plus"></i>
                Crear Usuario
              </button>


              <button class="btn btn-outline-info" disabled>
                <i class="bi bi-graph-up"></i>
                Ver Reportes (Próximamente)
              </button>
              <button class="btn btn-outline-secondary" disabled>
                <i class="bi bi-graph-up"></i>
                Ver Reportes (Próximamente)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Información del sistema -->
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="bi bi-info-circle"></i>
              Información del Sistema
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-6">
                <strong>Versión:</strong>
              </div>
              <div class="col-6">
                v1.0.0
              </div>
            </div>
            <hr>
            <div class="row">
              <div class="col-6">
                <strong>Última actualización:</strong>
              </div>
              <div class="col-6">
                {{ new Date().toLocaleDateString() }}
              </div>
            </div>
            <hr>
            <div class="row">
              <div class="col-6">
                <strong>Estado:</strong>
              </div>
              <div class="col-6">
                <span class="badge bg-success">Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de usuarios -->
      <div class="col-md-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="bi bi-people"></i>
              Usuarios del Sistema
            </h5>
            <div class="d-flex gap-2">
              <button class="btn btn-warning btn-sm" @click="resetUsers" :disabled="resettingUsers">
                <span v-if="resettingUsers" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-arrow-counterclockwise me-2"></i>
                {{ resettingUsers ? 'Reseteando...' : 'Resetear' }}
              </button>
              <button class="btn btn-primary btn-sm" @click="loadUsers">
                <i class="bi bi-arrow-clockwise"></i>
                Actualizar
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="loadingUsers" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando usuarios...</span>
              </div>
            </div>
            <div v-else-if="users.length === 0" class="text-center py-3 text-muted">
              No hay usuarios registrados
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Rol</th>
                    <th>Creado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.username">
                    <td>
                      <code>{{ user.username }}</code>
                    </td>
                    <td>{{ user.name }}</td>
                    <td>{{ user.surname }}</td>
                    <td>
                      <span :class="['badge', user.role === 'admin' ? 'bg-danger' : 'bg-primary']">
                        {{ user.role === 'admin' ? 'Administrador' : 'Usuario' }}
                      </span>
                    </td>
                    <td>
                      <small class="text-muted">
                        {{ formatDate(user.createdAt) }}
                      </small>
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        <button class="btn btn-outline-primary btn-sm" @click="editUser(user)" title="Editar usuario">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button v-if="user.username !== 'UT603324'" class="btn btn-outline-danger btn-sm"
                          @click="confirmDeleteUser(user)" title="Eliminar usuario">
                          <i class="bi bi-trash"></i>
                        </button>
                        <span v-else class="badge bg-secondary" title="Administrador principal protegido">
                          Protegido
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <!-- Gestión de Proyectos -->
      <div class="col-md-12 mt-4">
        <div class="card">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">
                <i class="bi bi-folder"></i>
                Gestión de Proyectos
              </h5>
              <button class="btn btn-primary btn-sm" @click="loadAllProjects">
                <i class="bi bi-arrow-clockwise"></i>
                Actualizar
              </button>
            </div>

            <!-- Filtros -->
            <div class="row g-2">
              <div class="col-md-4">
                <input v-model="projectFilters.search" type="text" class="form-control form-control-sm"
                  placeholder="Buscar por título..." @input="filterProjects">
              </div>
              <div class="col-md-3">
                <select v-model="projectFilters.owner" class="form-select form-select-sm" @change="filterProjects">
                  <option value="">Todos los usuarios</option>
                  <option v-for="owner in uniqueOwners" :key="owner.ownerId" :value="owner.ownerId">
                    {{ owner.displayName }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <select v-model="projectFilters.status" class="form-select form-select-sm" @change="filterProjects">
                  <option value="">Todos</option>
                  <option value="public">Públicos</option>
                  <option value="private">Privados</option>
                </select>
              </div>
              <div class="col-md-2">
                <select v-model="projectFilters.type" class="form-select form-select-sm" @change="filterProjects">
                  <option value="">Todos</option>
                  <option value="project">Proyectos</option>
                  <option value="template">Plantillas</option>
                </select>
              </div>
              <div class="col-md-1">
                <button class="btn btn-outline-secondary btn-sm w-100" @click="clearFilters">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div v-if="loadingProjects" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando proyectos...</span>
              </div>
            </div>
            <div v-else-if="filteredProjects.length === 0" class="text-center py-3 text-muted">
              {{ allProjects.length === 0 ? 'No hay proyectos en el sistema' : 'No hay proyectos que coincidan con los filtros' }}
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Propietario</th>
                    <th>Estado</th>
                    <th>Tipo</th>
                    <th>Actualizado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="project in filteredProjects" :key="project.id">
                    <td>
                      <strong>{{ project.title }}</strong>
                      <br>
                      <small class="text-muted" v-if="project.subtitle">{{ project.subtitle }}</small>
                    </td>
                    <td>
                      <div v-if="project.owner">
                        <strong>{{ project.owner.name }} {{ project.owner.surname }}</strong>
                        <br>
                        <small class="text-muted">({{ project.owner.username }})</small>
                      </div>
                      <div v-else>
                        <code class="small text-muted">{{ project.ownerId }}</code>
                        <br>
                        <small class="text-muted">Usuario no encontrado</small>
                      </div>
                    </td>
                    <td>
                      <span :class="['badge', project.isPublic ? 'bg-success' : 'bg-secondary']">
                        <i :class="project.isPublic ? 'bi bi-globe' : 'bi bi-lock'"></i>
                        {{ project.isPublic ? 'Público' : 'Privado' }}
                      </span>
                    </td>
                    <td>
                      <span v-if="project.isTemplate" class="badge bg-info">
                        <i class="bi bi-file-earmark-text"></i>
                        Plantilla
                      </span>
                      <span v-else class="badge bg-primary">
                        <i class="bi bi-folder"></i>
                        Proyecto
                      </span>
                    </td>
                    <td>
                      <small class="text-muted">
                        {{ formatDate(project.updatedAt) }}
                      </small>
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        <button class="btn btn-outline-primary btn-sm" @click="openProject(project.id)"
                          title="Ver proyecto">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          :class="['btn', 'btn-sm', project.isPublic ? 'btn-outline-secondary' : 'btn-outline-success']"
                          @click="toggleProjectPublic(project)"
                          :title="project.isPublic ? 'Marcar como privado' : 'Marcar como público'">
                          <i :class="project.isPublic ? 'bi bi-lock' : 'bi bi-globe'"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" @click="deleteProjectAdmin(project)"
                          title="Eliminar proyecto">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear usuario -->
    <div v-if="showCreateUserModal" class="modal fade show d-block" tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-person-plus"></i>
              Crear Nuevo Usuario
            </h5>
            <button type="button" class="btn-close" @click="closeCreateUserModal"></button>
          </div>
          <form @submit.prevent="createUser">
            <div class="modal-body">
              <div class="mb-3">
                <label for="newUsername" class="form-label">Usuario *</label>
                <input id="newUsername" v-model="newUser.username" type="text" class="form-control"
                  :class="{ 'is-invalid': createUserError }" placeholder="UT123456 o A123456" maxlength="8" required
                  :disabled="creatingUser" />
                <div class="form-text">
                  Formato: UT + 6 dígitos o 1 letra + 6 números
                </div>
              </div>

              <div class="mb-3">
                <label for="newName" class="form-label">Nombre *</label>
                <input id="newName" v-model="newUser.name" type="text" class="form-control"
                  :class="{ 'is-invalid': createUserError }" placeholder="Nombre del usuario" required
                  :disabled="creatingUser" />
              </div>

              <div class="mb-3">
                <label for="newSurname" class="form-label">Apellido *</label>
                <input id="newSurname" v-model="newUser.surname" type="text" class="form-control"
                  :class="{ 'is-invalid': createUserError }" placeholder="Apellido del usuario" required
                  :disabled="creatingUser" />
              </div>

              <div class="mb-3">
                <label for="newPassword" class="form-label">Contraseña *</label>
                <input id="newPassword" v-model="newUser.password" type="password" class="form-control"
                  :class="{ 'is-invalid': createUserError }" placeholder="Contraseña del usuario" required
                  :disabled="creatingUser" />
              </div>

              <div class="mb-3">
                <label for="newRole" class="form-label">Rol *</label>
                <select id="newRole" v-model="newUser.role" class="form-select"
                  :class="{ 'is-invalid': createUserError }" required :disabled="creatingUser">
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div v-if="createUserError" class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i>
                {{ createUserError }}
              </div>

              <div v-if="createUserSuccess" class="alert alert-success">
                <i class="bi bi-check-circle"></i>
                {{ createUserSuccess }}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeCreateUserModal" :disabled="creatingUser">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="creatingUser || !isFormValid">
                <span v-if="creatingUser" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-person-plus me-2"></i>
                {{ creatingUser ? 'Creando...' : 'Crear Usuario' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal para editar usuario -->
    <div v-if="showEditUserModal" class="modal fade show d-block" tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil"></i>
              Editar Usuario: {{ editingUser?.username }}
            </h5>
            <button type="button" class="btn-close" @click="closeEditUserModal"></button>
          </div>
          <form @submit.prevent="updateUser">
            <div class="modal-body">
              <div class="mb-3">
                <label for="editName" class="form-label">Nombre *</label>
                <input id="editName" v-model="editUserForm.name" type="text" class="form-control"
                  :class="{ 'is-invalid': editUserError }" placeholder="Nombre del usuario" required
                  :disabled="updatingUser" />
              </div>

              <div class="mb-3">
                <label for="editSurname" class="form-label">Apellido *</label>
                <input id="editSurname" v-model="editUserForm.surname" type="text" class="form-control"
                  :class="{ 'is-invalid': editUserError }" placeholder="Apellido del usuario" required
                  :disabled="updatingUser" />
              </div>

              <div class="mb-3">
                <label for="editPassword" class="form-label">Nueva Contraseña (opcional)</label>
                <input id="editPassword" v-model="editUserForm.password" type="password" class="form-control"
                  :class="{ 'is-invalid': editUserError }" placeholder="Dejar vacío para mantener la actual"
                  :disabled="updatingUser" />
                <div class="form-text">
                  Dejar vacío para mantener la contraseña actual
                </div>
              </div>

              <div class="mb-3">
                <label for="editRole" class="form-label">Rol *</label>
                <select id="editRole" v-model="editUserForm.role" class="form-select"
                  :class="{ 'is-invalid': editUserError }" required :disabled="updatingUser">
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div v-if="editUserError" class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i>
                {{ editUserError }}
              </div>

              <div v-if="editUserSuccess" class="alert alert-success">
                <i class="bi bi-check-circle"></i>
                {{ editUserSuccess }}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeEditUserModal" :disabled="updatingUser">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="updatingUser || !isEditFormValid">
                <span v-if="updatingUser" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-lg me-2"></i>
                {{ updatingUser ? 'Actualizando...' : 'Actualizar Usuario' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar usuario -->
    <div v-if="showDeleteConfirmModal" class="modal fade show d-block" tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="bi bi-exclamation-triangle"></i>
              Confirmar Eliminación
            </h5>
            <button type="button" class="btn-close" @click="closeDeleteConfirmModal"></button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar al usuario?</p>
            <div class="alert alert-warning">
              <strong>Usuario:</strong> {{ userToDelete?.username }}<br>
              <strong>Nombre:</strong> {{ userToDelete?.name }} {{ userToDelete?.surname }}<br>
              <strong>Rol:</strong> {{ userToDelete?.role === 'admin' ? 'Administrador' : 'Usuario' }}
            </div>
            <p class="text-danger">
              <i class="bi bi-exclamation-triangle"></i>
              <strong>Esta acción no se puede deshacer.</strong>
            </p>

            <div v-if="deleteUserError" class="alert alert-danger">
              <i class="bi bi-exclamation-triangle"></i>
              {{ deleteUserError }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteConfirmModal" :disabled="deletingUser">
              Cancelar
            </button>
            <button type="button" class="btn btn-danger" @click="deleteUser" :disabled="deletingUser">
              <span v-if="deletingUser" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-trash me-2"></i>
              {{ deletingUser ? 'Eliminando...' : 'Eliminar Usuario' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'

// Middleware de administrador
definePageMeta({
  middleware: 'admin'
})

// Middleware de autenticación eliminado (duplicado)

const authStore = useAuthStore()
const router = useRouter()

const stats = ref({
  totalUsers: 1,
  adminUsers: 1,
  totalProjects: 0,
  systemStatus: 'active'
})

// Estado para gestión de usuarios
const users = ref([] as any[])
const loadingUsers = ref(false)
const resettingUsers = ref(false)

// Estado para gestión de proyectos
const allProjects = ref([] as any[])
const filteredProjects = ref([] as any[])
const loadingProjects = ref(false)

// Filtros para proyectos
const projectFilters = ref({
  search: '',
  owner: '',
  status: '',
  type: ''
})

// Estado para crear usuario
const showCreateUserModal = ref(false)
const creatingUser = ref(false)
const createUserError = ref('')
const createUserSuccess = ref('')

const newUser = ref({
  username: '',
  name: '',
  surname: '',
  password: '',
  role: 'user'
})

// Estado para editar usuario
const showEditUserModal = ref(false)
const editingUser = ref(null as any)
const updatingUser = ref(false)
const editUserError = ref('')
const editUserSuccess = ref('')

const editUserForm = ref({
  name: '',
  surname: '',
  password: '',
  role: 'user'
})

// Estado para eliminar usuario
const showDeleteConfirmModal = ref(false)
const userToDelete = ref(null as any)
const deletingUser = ref(false)
const deleteUserError = ref('')

onMounted(() => {
  // Verificar autenticación
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    router.push('/login')
    return
  }

  // Cargar datos iniciales
  loadStats()
  loadUsers()
  loadAllProjects()
})

const loadStats = () => {
  // Por ahora estadísticas simuladas
  // En el futuro se pueden cargar desde la API
  stats.value = {
    totalUsers: 1,
    adminUsers: 1,
    totalProjects: 0,
    systemStatus: 'active'
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const goToProject = () => {
  // Navegar a /project/new para crear un nuevo proyecto
  router.push('/project/new')
}

// Funciones para gestión de usuarios
const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const response = await $fetch('/api/users/list') as any
    if (response.success) {
      users.value = response.users
      // Actualizar estadísticas
      stats.value.totalUsers = response.users.length
      stats.value.adminUsers = response.users.filter((u: any) => u.role === 'admin').length
    }
  } catch (error) {
    console.error('Error cargando usuarios:', error)
  } finally {
    loadingUsers.value = false
  }
}

const createUser = async () => {
  createUserError.value = ''
  createUserSuccess.value = ''
  creatingUser.value = true

  try {
    const response = await $fetch('/api/users/create', {
      method: 'POST',
      body: newUser.value
    }) as any

    if (response.success) {
      createUserSuccess.value = response.message
      // Recargar lista de usuarios
      await loadUsers()
      // Limpiar formulario después de un delay
      setTimeout(() => {
        closeCreateUserModal()
      }, 1500)
    } else {
      createUserError.value = response.error
    }
  } catch (error) {
    createUserError.value = 'Error de conexión'
  } finally {
    creatingUser.value = false
  }
}

const closeCreateUserModal = () => {
  showCreateUserModal.value = false
  createUserError.value = ''
  createUserSuccess.value = ''
  newUser.value = {
    username: '',
    name: '',
    surname: '',
    password: '',
    role: 'user'
  }
}

const isFormValid = computed(() => {
  return newUser.value.username &&
    newUser.value.name &&
    newUser.value.surname &&
    newUser.value.password &&
    newUser.value.role
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTokenExpiration = () => {
  if (!authStore.tokenExpiration) return 'No disponible'

  return authStore.tokenExpiration.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Funciones para resetear usuarios
const resetUsers = async () => {
  if (!confirm('¿Estás seguro de que deseas eliminar todos los usuarios excepto el administrador principal?')) {
    return
  }

  resettingUsers.value = true
  try {
    const response = await $fetch('/api/users/reset', {
      method: 'POST'
    }) as any

    if (response.success) {
      await loadUsers()
      // Mostrar toast de éxito
      const { showSuccess } = useToast()
      showSuccess('Usuarios Reseteados', response.message)
    } else {
      const { showError } = useToast()
      showError('Error al Resetear', response.error)
    }
  } catch (error) {
    const { showError } = useToast()
    showError('Error de Conexión', 'No se pudo resetear los usuarios')
  } finally {
    resettingUsers.value = false
  }
}

// Funciones para editar usuario
const editUser = (user: any) => {
  editingUser.value = user
  editUserForm.value = {
    name: user.name,
    surname: user.surname,
    password: '',
    role: user.role
  }
  editUserError.value = ''
  editUserSuccess.value = ''
  showEditUserModal.value = true
}

const updateUser = async () => {
  editUserError.value = ''
  editUserSuccess.value = ''
  updatingUser.value = true

  try {
    const response = await $fetch('/api/users/edit', {
      method: 'POST',
      body: {
        username: editingUser.value.username,
        ...editUserForm.value
      }
    }) as any

    if (response.success) {
      editUserSuccess.value = response.message
      await loadUsers()
      setTimeout(() => {
        closeEditUserModal()
      }, 1500)
    } else {
      editUserError.value = response.error
    }
  } catch (error) {
    editUserError.value = 'Error de conexión'
  } finally {
    updatingUser.value = false
  }
}

const closeEditUserModal = () => {
  showEditUserModal.value = false
  editingUser.value = null
  editUserError.value = ''
  editUserSuccess.value = ''
  editUserForm.value = {
    name: '',
    surname: '',
    password: '',
    role: 'user'
  }
}

const isEditFormValid = computed(() => {
  return editUserForm.value.name &&
    editUserForm.value.surname &&
    editUserForm.value.role
})

// Funciones para eliminar usuario
const confirmDeleteUser = (user: any) => {
  userToDelete.value = user
  deleteUserError.value = ''
  showDeleteConfirmModal.value = true
}

const deleteUser = async () => {
  deleteUserError.value = ''
  deletingUser.value = true

  try {
    const response = await $fetch('/api/users/delete', {
      method: 'POST',
      body: {
        username: userToDelete.value.username
      }
    }) as any

    if (response.success) {
      await loadUsers()
      closeDeleteConfirmModal()
      const { showSuccess } = useToast()
      showSuccess('Usuario Eliminado', response.message)
    } else {
      deleteUserError.value = response.error
    }
  } catch (error) {
    deleteUserError.value = 'Error de conexión'
  } finally {
    deletingUser.value = false
  }
}

const closeDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = false
  userToDelete.value = null
  deleteUserError.value = ''
}

// Funciones para gestión de proyectos
const loadAllProjects = async () => {
  loadingProjects.value = true
  try {
    const response = await $fetch('/api/admin/projects', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    }) as any

    if (response.success) {
      allProjects.value = response.projects
      // Actualizar estadísticas
      stats.value.totalProjects = response.projects.length
      // Aplicar filtros
      filterProjects()
    }
  } catch (error) {
    console.error('Error cargando proyectos:', error)
    const { showError } = useToast()
    showError('Error', 'No se pudieron cargar los proyectos')
  } finally {
    loadingProjects.value = false
  }
}

const toggleProjectPublic = async (project: any) => {
  const newState = !project.isPublic
  const action = newState ? 'público' : 'privado'

  if (!confirm(`¿Marcar el proyecto "${project.title}" como ${action}?`)) {
    return
  }

  try {
    const response = await $fetch('/api/admin/toggle-project-public', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      body: {
        projectId: project.id,
        isPublic: newState
      }
    }) as any

    if (response.success) {
      // Actualizar el proyecto en la lista local
      const projectIndex = allProjects.value.findIndex(p => p.id === project.id)
      if (projectIndex !== -1) {
        allProjects.value[projectIndex].isPublic = newState
      }

      // Actualizar filtros
      filterProjects()

      const { showSuccess } = useToast()
      showSuccess('Proyecto Actualizado', response.message)
    }
  } catch (error) {
    console.error('Error cambiando estado público:', error)
    const { showError } = useToast()
    showError('Error', 'No se pudo cambiar el estado del proyecto')
  }
}

const openProject = async (projectId: string) => {
  await router.push(`/project/${projectId}`)
}

// Computed para obtener propietarios únicos
const uniqueOwners = computed(() => {
  const owners = new Map()

  allProjects.value.forEach(project => {
    if (project.owner && !owners.has(project.ownerId)) {
      owners.set(project.ownerId, {
        ownerId: project.ownerId,
        displayName: project.owner.displayName
      })
    }
  })

  return Array.from(owners.values()).sort((a, b) => a.displayName.localeCompare(b.displayName))
})

// Función para filtrar proyectos
const filterProjects = () => {
  let filtered = [...allProjects.value]

  // Filtro por búsqueda de texto
  if (projectFilters.value.search) {
    const search = projectFilters.value.search.toLowerCase()
    filtered = filtered.filter(project =>
      project.title.toLowerCase().includes(search) ||
      (project.subtitle && project.subtitle.toLowerCase().includes(search))
    )
  }

  // Filtro por propietario
  if (projectFilters.value.owner) {
    filtered = filtered.filter(project => project.ownerId === projectFilters.value.owner)
  }

  // Filtro por estado (público/privado)
  if (projectFilters.value.status) {
    const isPublic = projectFilters.value.status === 'public'
    filtered = filtered.filter(project => project.isPublic === isPublic)
  }

  // Filtro por tipo (proyecto/plantilla)
  if (projectFilters.value.type) {
    const isTemplate = projectFilters.value.type === 'template'
    filtered = filtered.filter(project => project.isTemplate === isTemplate)
  }

  filteredProjects.value = filtered
}

// Función para limpiar filtros
const clearFilters = () => {
  projectFilters.value = {
    search: '',
    owner: '',
    status: '',
    type: ''
  }
  filterProjects()
}

// Función para eliminar proyecto (admin)
const deleteProjectAdmin = async (project: any) => {
  const { showSuccess, showError } = useToast()

  if (!confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.title}"?\n\nEsta acción no se puede deshacer. El proyecto se descargará automáticamente antes de eliminarse.`)) {
    return
  }

  try {
    // Primero descargar el proyecto como respaldo
    const downloadResponse = await $fetch(`/api/projects/${project.id}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if ((downloadResponse as any).project) {
      // Crear y descargar el archivo
      const dataStr = JSON.stringify((downloadResponse as any).project, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${project.title || 'proyecto'}.prj`
      link.click()
      URL.revokeObjectURL(url)
    }

    // Luego eliminar de la base de datos
    const deleteResponse = await $fetch(`/api/projects/${project.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if ((deleteResponse as any).success) {
      showSuccess('Proyecto Eliminado', 'El proyecto ha sido eliminado correctamente. Se ha descargado una copia de respaldo.')

      // Recargar la lista de proyectos
      await loadAllProjects()
    }
  } catch (error: any) {
    console.error('❌ Error eliminando proyecto:', error)

    if (error.statusCode === 403) {
      showError('Sin Permisos', 'No tienes permisos para eliminar este proyecto')
    } else if (error.statusCode === 404) {
      showError('No Encontrado', 'El proyecto no existe o ya fue eliminado')
    } else {
      showError('Error', 'No se pudo eliminar el proyecto')
    }
  }
}






</script>

<style scoped>
.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  border-radius: 12px 12px 0 0 !important;
}

.btn {
  border-radius: 8px;
}

.list-group-item {
  border: none;
  border-bottom: 1px solid #e9ecef;
}

.list-group-item:last-child {
  border-bottom: none;
}
</style>