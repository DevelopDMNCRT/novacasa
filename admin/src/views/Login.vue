<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Phone } from 'lucide-vue-next'
import { API_BASE_URL } from '../config'

const router = useRouter()
const telefono = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)

const handleLogin = async () => {
  loading.value = true
  error.value = null
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telefono: telefono.value,
        contraseña: password.value
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión')

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    router.push('/')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card glass-card">
      <div class="login-header">
        <h1 class="login-title">Admin Login</h1>
        <p class="login-subtitle">Ingresa tus credenciales de administrador</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label><Phone :size="16" /> Teléfono (WhatsApp)</label>
          <input 
            type="tel" 
            v-model="telefono" 
            placeholder="Ej: 5512345678" 
            required
          />
        </div>

        <div class="form-group">
          <label><Lock :size="16" /> Contraseña</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="********" 
            required
          />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'ENTRANDO...' : 'INICIAR SESIÓN' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 3rem;
  background: white;
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #6b6375;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #4b5563;
}

.form-group input {
  padding: 0.8rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s;
}

.form-group input:focus {
  border-color: #006847;
}

.btn-login {
  background: #006847;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.btn-login:hover {
  background: #004d35;
  transform: translateY(-2px);
}

.error-msg {
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}
</style>
