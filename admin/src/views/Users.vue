<script setup>
import { ref, onMounted } from 'vue'
import { Search, Mail, Phone, Trash2, Edit } from 'lucide-vue-next'
import { API_BASE_URL } from '../config.js'

const users = ref([])
const searchQuery = ref('')
const isModalOpen = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')
const isEditing = ref(false)
const editingUserId = ref(null)
const newUser = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const openNewUserModal = () => {
  isEditing.value = false
  editingUserId.value = null
  newUser.value = { name: '', email: '', phone: '', password: '', confirmPassword: '' }
  errorMsg.value = ''
  isModalOpen.value = true
}

const editUser = (user) => {
  isEditing.value = true
  editingUserId.value = user.id
  newUser.value = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    password: '',
    confirmPassword: ''
  }
  errorMsg.value = ''
  isModalOpen.value = true
}

// Cargar usuarios desde la API
const fetchUsers = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/usuarios`)
    const data = await res.json()
    users.value = data.map(u => ({
      id: u.id,
      name: u.nombre,
      email: u.correo,
      phone: u.telefono,
      activo: u.activo,
      created_at: u.created_at
    }))
  } catch (err) {
    console.error('Error al cargar usuarios:', err)
  }
}

onMounted(fetchUsers)

// Guardar nuevo usuario
const saveUser = async () => {
  if (newUser.value.password !== newUser.value.confirmPassword) return

  isLoading.value = true
  errorMsg.value = ''

  try {
    const url = isEditing.value ? `${API_BASE_URL}/api/usuarios/${editingUserId.value}` : `${API_BASE_URL}/api/usuarios`
    const method = isEditing.value ? 'PUT' : 'POST'
    
    const bodyData = {
      nombre: newUser.value.name,
      correo: newUser.value.email,
      telefono: newUser.value.phone
    }
    
    // Solo enviar contraseña si se escribió una
    if (newUser.value.password) {
      bodyData.contraseña = newUser.value.password
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })

    const data = await res.json()

    if (!res.ok) {
      errorMsg.value = data.error || (isEditing.value ? 'Error al actualizar usuario.' : 'Error al crear usuario.')
      return
    }

    await fetchUsers()
    isModalOpen.value = false
    newUser.value = { name: '', email: '', phone: '', password: '', confirmPassword: '' }
  } catch (err) {
    errorMsg.value = 'Error de conexión con el servidor.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Toggle activo / inactivo
const toggleStatus = async (user) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/usuarios/${user.id}/toggle`, { method: 'PATCH' })
    const data = await res.json()
    if (res.ok) {
      user.activo = data.activo
    }
  } catch (err) {
    console.error('Error al cambiar estado:', err)
  }
}

// Eliminar usuario (soft delete)
const deleteUser = async (id) => {
  if (!confirm('¿Seguro que deseas eliminar este usuario?')) return
  try {
    await fetch(`${API_BASE_URL}/api/usuarios/${id}`, { method: 'DELETE' })
    await fetchUsers()
  } catch (err) {
    console.error('Error al eliminar usuario:', err)
  }
}
</script>


<template>
  <div class="users-page">
    <header class="section-header">
      <div class="header-left">
        <h1 class="page-title">Gestión de Usuarios</h1>
        <p class="page-subtitle">Visualiza y administra las cuentas registradas en el sistema.</p>
      </div>
      <button class="btn-add" @click="openNewUserModal">Nuevo Usuario</button>
    </header>

    <div class="table-controls glass-card">
      <div class="search-wrapper">
        <Search :size="20" class="search-icon" />
        <input type="text" v-model="searchQuery" placeholder="Buscar por nombre, email o teléfono..." class="search-input" />
      </div>
    </div>

    <div class="table-card glass-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Contacto</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
                <div class="user-info">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-id">ID: #{{ user.id }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="contact-cell">
                <div class="contact-item"><Mail :size="14" /> {{ user.email }}</div>
                <div class="contact-item"><Phone :size="14" /> {{ user.phone }}</div>
              </div>
            </td>
            <td>
              <span
                class="status-badge"
                :class="user.activo ? 'activo' : 'inactivo'"
                style="cursor:pointer"
                :title="user.activo ? 'Click para desactivar' : 'Click para activar'"
                @click="toggleStatus(user)"
              >
                {{ user.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="text-right">
              <div class="action-buttons">
                <button class="btn-icon" title="Editar" @click="editUser(user)"><Edit :size="18" /></button>
                <button class="btn-icon btn-danger" title="Eliminar" @click="deleteUser(user.id)"><Trash2 :size="18" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Nuevo / Editar Usuario -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
      <div class="modal-content">
        <h2 class="modal-title">{{ isEditing ? 'Editar Usuario' : 'Registrar Nuevo Usuario' }}</h2>
        <form @submit.prevent="saveUser" class="modal-form">
          <div class="form-group">
            <label for="name">Nombre Completo</label>
            <input type="text" id="name" v-model="newUser.name" required placeholder="Ej. Juan Pérez" />
          </div>
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" v-model="newUser.email" required placeholder="Ej. juan@example.com" />
          </div>
          <div class="form-group">
            <label for="phone">Teléfono (WhatsApp)</label>
            <input type="text" id="phone" v-model="newUser.phone" required placeholder="Ej. 5512345678" />
          </div>
          <div class="form-group">
            <label for="password">Contraseña {{ isEditing ? '(Dejar en blanco para mantener la actual)' : '' }}</label>
            <input type="password" id="password" v-model="newUser.password" :required="!isEditing" placeholder="Mínimo 6 caracteres" minlength="6" />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirmar Contraseña</label>
            <input type="password" id="confirmPassword" v-model="newUser.confirmPassword" :required="!isEditing && !!newUser.password" placeholder="Repite la contraseña" minlength="6" :class="{ 'input-error': newUser.confirmPassword && newUser.password !== newUser.confirmPassword }" />
            <span v-if="newUser.confirmPassword && newUser.password !== newUser.confirmPassword" class="error-text">Las contraseñas no coinciden</span>
          </div>
          <div class="form-group" v-if="errorMsg">
            <span class="error-text">{{ errorMsg }}</span>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="isModalOpen = false">Cancelar</button>
            <button type="submit" class="btn-submit" :disabled="isLoading">{{ isLoading ? 'Guardando...' : 'Guardar Usuario' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-page {
  padding: 2rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6b6375;
  font-size: 1.1rem;
}

.btn-add {
  background: #006847;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add:hover {
  background: #004d35;
  transform: translateY(-2px);
}

.table-controls {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
}

.search-wrapper {
  position: relative;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 3rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #006847;
  box-shadow: 0 0 0 3px rgba(0, 104, 71, 0.1);
}

.table-card {
  background: white;
  padding: 0;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  padding: 1.25rem 2rem;
  text-align: left;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b6375;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.admin-table td {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #006847;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.user-name {
  display: block;
  font-weight: 700;
  color: #1a1a2e;
}

.user-id {
  font-size: 0.75rem;
  color: #9ca3af;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
}

.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.activo {
  background: #e8f5e9;
  color: #2e7d32;
  transition: background 0.3s, color 0.3s;
}
.status-badge.activo:hover {
  background: #c8e6c9;
}
.status-badge.inactivo {
  background: #fef2f2;
  color: #991b1b;
  transition: background 0.3s, color 0.3s;
}
.status-badge.inactivo:hover {
  background: #fee2e2;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover { background: #e5e7eb; color: #1a1a2e; }
.btn-icon.btn-danger:hover { background: #fee2e2; color: #dc2626; }

.text-right { text-align: right !important; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(26, 26, 46, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 450px;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s;
}

.form-group input:focus {
  border-color: #006847;
  box-shadow: 0 0 0 3px rgba(0, 104, 71, 0.1);
}

.input-error {
  border-color: #dc2626 !important;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
}

.error-text {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.2rem;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-cancel {
  background: white;
  border: 1.5px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f3f4f6;
  color: #1a1a2e;
}

.btn-submit {
  background: #006847;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover {
  background: #004d35;
  transform: translateY(-2px);
}
</style>
