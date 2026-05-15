<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE_URL } from '../config'

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const token = ref('')

onMounted(() => {
  token.value = route.query.token || ''
  if (!token.value) {
    errorMsg.value = 'Enlace inválido. Solicita uno nuevo desde la pantalla de recuperación.'
  }
})

async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!password.value || !confirmPassword.value) {
    errorMsg.value = 'Todos los campos son requeridos.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Las contraseñas no coinciden.'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  loading.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value, password: password.value }),
    })
    const data = await res.json()
    if (!res.ok) {
      errorMsg.value = data.error || 'Error al restablecer la contraseña.'
      return
    }
    successMsg.value = '¡Contraseña actualizada! Redirigiendo...'
    setTimeout(() => router.push('/login'), 2000)
  } catch {
    errorMsg.value = 'No se pudo conectar con el servidor.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="flag-bar"></div>
        <h1 class="auth-title">Nueva contraseña</h1>
        <p class="auth-subtitle">Elige una contraseña segura para tu cuenta</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit" novalidate>
        <div class="field-group">
          <label class="field-label" for="password">Nueva contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="field-input"
            placeholder="Mínimo 6 caracteres"
            autocomplete="new-password"
            :disabled="!token"
          />
        </div>

        <div class="field-group">
          <label class="field-label" for="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="field-input"
            placeholder="Repite tu contraseña"
            autocomplete="new-password"
            :disabled="!token"
          />
        </div>

        <p v-if="errorMsg" class="msg msg-error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="msg msg-success">{{ successMsg }}</p>

        <button type="submit" class="btn-submit" :disabled="loading || !token || !!successMsg">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Guardando...' : 'Guardar contraseña' }}</span>
        </button>
      </form>

      <p class="auth-footer">
        <router-link to="/recuperar-contrasena" class="auth-link">Solicitar nuevo enlace</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 1rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e8f5e9 50%, #fce4ec 100%);
}

.auth-card {
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
}

.auth-header {
  padding: 2rem 2rem 0;
  text-align: center;
}

.flag-bar {
  height: 5px;
  background: linear-gradient(to right, #006847 33.33%, #ffffff 33.33%, #ffffff 66.66%, #CE1126 66.66%);
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 0.4rem;
  letter-spacing: -0.5px;
}

.auth-subtitle {
  font-size: 0.9rem;
  color: #6b6375;
  margin: 0 0 1.5rem;
}

.auth-form {
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #4a4a5a;
}

.field-input {
  padding: 0.7rem 0.5rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1a1a2e;
  background: #fafafa;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.field-input:focus {
  border-color: #006847;
  box-shadow: 0 0 0 3px rgba(0, 104, 71, 0.1);
  background: #fff;
}

.field-input:disabled { opacity: 0.5; cursor: not-allowed; }
.field-input::placeholder { color: #b0b0c0; }

.msg {
  font-size: 0.875rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  margin: 0;
}

.msg-error {
  background: #fdecea;
  color: #c62828;
  border: 1px solid #f5c6cb;
}

.msg-success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  background: #006847;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  margin-top: 0.25rem;
}

.btn-submit:hover:not(:disabled) { background: #00573c; }
.btn-submit:active:not(:disabled) { transform: scale(0.98); }
.btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.auth-footer {
  text-align: center;
  font-size: 0.875rem;
  color: #6b6375;
  padding: 0 2rem 1.75rem;
  margin: 0;
}

.auth-link {
  color: #006847;
  font-weight: 700;
  text-decoration: none;
}

.auth-link:hover { text-decoration: underline; }
</style>
