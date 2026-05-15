<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Menu, X, ChevronDown } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const isMenuOpen = ref(false)
const isDropdownOpen = ref(false)

const user = ref(null)

const updateUser = () => {
  try {
    const stored = localStorage.getItem('user')
    if (stored && stored !== 'undefined') {
      user.value = JSON.parse(stored)
    } else {
      user.value = null
    }
  } catch (err) {
    console.error('Error updating user:', err)
    user.value = null
  }
}

onMounted(() => {
  updateUser()
})

watch(() => route.path, () => {
  updateUser()
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  updateUser()
  closeMenu()
  closeDropdown()
  router.push('/login')
}
</script>

<template>
  <div class="mexican-bar"></div>
  <nav class="navbar animate-fade-in">
    <div class="nav-container header-white">
      <router-link to="/" class="logo">
        <img src="/logo.png" alt="Nova Casa Logo" class="nav-logo-img" />
      </router-link>

      <div class="nav-links">
        <router-link to="/" class="nav-link">Inicio</router-link>
        <router-link to="/mis-pronosticos" class="nav-link">Mis Pronósticos</router-link>
        <router-link to="/tabla-general" class="nav-link">Tabla General</router-link>
        <router-link to="/reglas" class="nav-link">Reglas</router-link>
      </div>

      <div class="nav-actions">
        <div class="auth-buttons">
          <template v-if="user">
            <div class="dropdown-wrapper" v-click-outside="closeDropdown">
              <button class="btn-register btn-cuenta" @click="toggleDropdown">
                Cuenta <ChevronDown :size="14" :class="{ 'chevron-open': isDropdownOpen }" />
              </button>
              <div v-if="isDropdownOpen" class="dropdown-menu">
                <router-link v-if="user && user.is_admin" to="/admin/resultados" class="dropdown-item" style="color: #006847; border-bottom: 1px solid #f0f0f0;" @click="closeDropdown">Admin Resultados</router-link>
                <router-link to="/perfil" class="dropdown-item" @click="closeDropdown">Perfil</router-link>
                <button class="dropdown-item dropdown-item-danger" @click="logout">Salir</button>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-register">Entrar</router-link>
          </template>
        </div>
        <button v-if="!isMenuOpen" class="mobile-menu" @click="toggleMenu">
          <Menu :size="24" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu Drawer -->
    <div v-if="isMenuOpen" class="mobile-overlay" @click="closeMenu"></div>
    <div :class="['mobile-drawer', { 'is-open': isMenuOpen }]">
      <button class="close-drawer" @click="closeMenu">
        <X :size="28" />
      </button>
      <div class="mobile-drawer-content">
        <router-link to="/" class="mobile-nav-link" @click="closeMenu">Inicio</router-link>
        <router-link to="/mis-pronosticos" class="mobile-nav-link" @click="closeMenu">Mis Pronósticos</router-link>
        <router-link to="/tabla-general" class="mobile-nav-link" @click="closeMenu">Tabla General</router-link>
        <router-link to="/reglas" class="mobile-nav-link" @click="closeMenu">Reglas</router-link>
        <div class="mobile-auth-divider"></div>
        <template v-if="user">
          <router-link v-if="user.is_admin" to="/admin/resultados" class="mobile-nav-link" style="color: #006847;" @click="closeMenu">Admin Resultados</router-link>
          <router-link to="/perfil" class="mobile-nav-link" @click="closeMenu">Perfil</router-link>
          <button class="mobile-nav-link mobile-nav-logout" @click="logout">Salir</button>
        </template>
        <template v-else>
          <router-link to="/login" class="mobile-nav-link mobile-nav-register" @click="closeMenu">Entrar</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.mexican-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  z-index: 2001;
  background: linear-gradient(to right, #006847 33.33%, #ffffff 33.33%, #ffffff 66.66%, #CE1126 66.66%);
}

.navbar {
  position: fixed;
  top: 1.5rem;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 2000;
  padding: 0 1rem;
}

.nav-container {
  max-width: 1200px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  border-radius: 0;
}

.header-white {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.nav-logo-img {
  height: 45px;
  width: auto;
  object-fit: contain;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.nav-link:hover, .router-link-active {
  color: var(--primary-color);
}


.nav-actions {
  display: flex;
  align-items: center;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}


.btn-register {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #fff;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  background: #006847;
  border: 1.5px solid #006847;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-register:hover {
  background: #00573c;
  border-color: #00573c;
}

.dropdown-wrapper {
  position: relative;
}

.btn-cuenta {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
}

.chevron-open {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  overflow: hidden;
  z-index: 3000;
  animation: dropIn 0.15s ease;
}

@keyframes dropIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.7rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a2e;
  text-decoration: none;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item-danger {
  color: #CE1126;
}

.dropdown-item-danger:hover {
  background: #fdecea;
}

.mobile-auth-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 0.5rem 0;
}

.mobile-user-greeting {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
}

.mobile-nav-register {
  color: #006847 !important;
}

.mobile-nav-logout {
  color: #CE1126 !important;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 0;
}

.mobile-menu {
  display: none;
  z-index: 1002;
  transition: all 0.3s ease;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  width: 80%;
  max-width: 300px;
  height: 100vh;
  background: white;
  z-index: 2005;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  padding: 6rem 2rem 2rem;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
}

.close-drawer {
  position: absolute;
  top: 2rem;
  right: 2rem;
  color: var(--text-primary);
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.close-drawer:hover {
  color: var(--primary-color);
  transform: rotate(90deg);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1004;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.mobile-drawer.is-open {
  right: 0;
}

.mobile-drawer-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.mobile-nav-link {
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--text-primary);
  transition: all 0.3s ease;
}


.mobile-nav-link:hover, .mobile-nav-link.router-link-active {
  color: var(--primary-color);
  padding-left: 10px;
}

@media (max-width: 992px) {
  .nav-links {
    display: none;
  }
  .auth-buttons {
    display: none;
  }
  .mobile-menu {
    display: block;
    color: var(--text-primary);
    padding: 0.5rem;
  }
  .nav-container {
    padding: 0.75rem 1.5rem;
  }
}
</style>
