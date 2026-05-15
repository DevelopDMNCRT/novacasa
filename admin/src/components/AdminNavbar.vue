<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Users, UserCheck, LogOut } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <nav v-if="route.name !== 'Login'" class="admin-nav">
    <div class="nav-container">
      <router-link to="/" class="admin-logo">
        <span class="logo-text">Admin <span class="highlight">Nova</span></span>
      </router-link>

      <div class="nav-links">
        <router-link to="/usuarios" class="nav-link">
          <Users :size="18" /> Usuarios
        </router-link>
        <router-link to="/participantes" class="nav-link">
          <UserCheck :size="18" /> Participantes
        </router-link>
      </div>

      <div class="nav-user">
        <div class="user-info">
          <span class="user-role">Administrador</span>
          <span class="user-name">{{ currentUser?.nombre || 'Admin' }}</span>
        </div>
        <button @click="handleLogout" class="btn-logout" title="Cerrar Sesión">
          <LogOut :size="20" />
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.admin-nav {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0 2rem;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-logo {
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 900;
  color: #1a1a2e;
}

.highlight {
  color: #006847;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  color: #6b6375;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover, .router-link-active {
  color: #006847;
  background: #f0fdf4;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  text-align: right;
}

.user-role {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
}

.user-name {
  font-weight: 700;
  color: #1a1a2e;
}

.btn-logout {
  width: 40px;
  height: 40px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: #dc2626;
  color: white;
}
</style>
