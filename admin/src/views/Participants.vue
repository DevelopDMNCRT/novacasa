<script setup>
import { ref, onMounted } from 'vue'
import { Trophy, TrendingUp, Filter, Phone, Calendar, User, RefreshCw, Download, Mail } from 'lucide-vue-next'
import { API_BASE_URL } from '../config'

const users = ref([])
const loading = ref(true)
const error = ref(null)

const fetchUsers = async () => {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = 'No se encontró un token de administrador. Inicia sesión en la quiniela como administrador primero.'
      return
    }

    const res = await fetch(`${API_BASE_URL}/api/admin/participantes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!res.ok) {
      if (res.status === 403) throw new Error('No tienes permisos de administrador.')
      throw new Error('Error al obtener los usuarios.')
    }

    users.value = await res.json()
  } catch (err) {
    error.value = err.message
    console.error('Error fetching users:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

const exportCSV = () => {
  if (users.value.length === 0) return
  
  const headers = ['Nombre', 'Correo', 'WhatsApp', 'Ciudad', 'Estado', 'Fecha de Alta']
  const rows = users.value.map(u => [
    u.nombre,
    u.correo,
    u.numero,
    u.ciudad || '',
    u.estado || '',
    new Date(u.created_at).toLocaleString()
  ])
  
  const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `participantes_quiniela_${new Date().toLocaleDateString()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="participants-page">
    <header class="section-header">
      <div class="header-left">
        <h1 class="page-title">Participantes Registrados</h1>
        <p class="page-subtitle">Lista completa de usuarios que se han dado de alta en la quiniela.</p>
      </div>
      <div class="header-actions">
        <button @click="fetchUsers" class="btn-outline" :disabled="loading">
          <RefreshCw :size="18" :class="{ 'animate-spin': loading }" />
          Actualizar
        </button>
        <button @click="exportCSV" class="btn-primary" :disabled="loading || users.length === 0">
          <Download :size="18" />
          Exportar CSV
        </button>
      </div>
    </header>

    <div v-if="error" class="error-banner">
      {{ error }}
    </div>

    <div v-if="loading && users.length === 0" class="loading-state">
      <RefreshCw :size="48" class="animate-spin spin-large" />
      <p>Cargando participantes...</p>
    </div>

    <div v-else class="table-card glass-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>WhatsApp</th>
            <th>Ciudad</th>
            <th>Estado</th>
            <th>Fecha de Alta</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>
              <div class="user-cell">
                <div class="user-avatar">
                  <User :size="16" />
                </div>
                <span class="p-name">{{ u.nombre }}</span>
              </div>
            </td>
            <td>
              <div class="contact-cell">
                <Mail :size="14" class="icon-dim" />
                <span class="p-email">{{ u.correo }}</span>
              </div>
            </td>
            <td>
              <div class="contact-cell">
                <Phone :size="14" class="icon-dim" />
                <span class="p-phone">{{ u.numero }}</span>
              </div>
            </td>
            <td>
              <span class="p-location">{{ u.ciudad || '—' }}</span>
            </td>
            <td>
              <span class="location-badge">{{ u.estado || '—' }}</span>
            </td>
            <td>
              <div class="date-cell">
                <Calendar :size="14" class="icon-dim" />
                <span class="p-date">{{ formatDate(u.created_at) }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="users.length === 0 && !loading" class="empty-state">
        No hay usuarios registrados todavía.
      </div>
    </div>
  </div>
</template>

<style scoped>
.participants-page {
  padding: 2rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 2rem;
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #006847, #004d35);
  color: white;
  border: none;
  padding: 0.8rem 1.8rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 104, 71, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 104, 71, 0.3);
  filter: brightness(1.1);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: #006847;
  border: 2px solid #006847;
  padding: 0.8rem 1.8rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.3s ease;
}

.btn-outline:hover:not(:disabled) {
  background: #f0fdf4;
  transform: translateY(-2px);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-large {
  color: #006847;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.error-banner {
  background: #fef2f2;
  color: #991b1b;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  margin-bottom: 2rem;
  font-weight: 600;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem;
  color: #6b6375;
  font-weight: 600;
}

.table-card {
  background: white;
  padding: 0;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  padding: 1.5rem 2rem;
  text-align: left;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.75rem;
  font-weight: 800;
  color: #6b6375;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.admin-table td {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: #f0fdf4;
  color: #006847;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcfce7;
}

.p-name { font-weight: 700; color: #1a1a2e; font-size: 1rem; }

.contact-cell, .date-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4b5563;
  font-size: 0.95rem;
  font-weight: 500;
}

.icon-dim {
  color: #9ca3af;
}

.role-badge {
  display: inline-block;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  background: #f3f4f6;
  color: #6b6375;
  letter-spacing: 0.5px;
}

.role-badge.admin {
  background: linear-gradient(135deg, #006847, #004d35);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 104, 71, 0.2);
}

.empty-state {
  padding: 5rem;
  text-align: center;
  color: #9ca3af;
  font-size: 1.1rem;
}

.text-right { text-align: right !important; }

.p-location {
  color: #4b5563;
  font-size: 0.92rem;
  font-weight: 500;
}

.location-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #f0fdf4;
  color: #006847;
  border: 1px solid #dcfce7;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
  }
  .btn-primary, .btn-outline {
    flex: 1;
    justify-content: center;
  }
}
</style>
