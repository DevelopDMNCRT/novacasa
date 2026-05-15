<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '../config'

const router = useRouter()

const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

const name = ref(storedUser.name || '')
const email = storedUser.email || ''
const whatsapp = storedUser.whatsapp || ''
const ciudad = ref(storedUser.ciudad || '')
const estado = ref(storedUser.estado || '')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Lista de estados de México y estados de EE.UU.
const estadosMX = [
  'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas',
  'Chihuahua','Ciudad de México','Coahuila','Colima','Durango','Guanajuato',
  'Guerrero','Hidalgo','Jalisco','México','Michoacán','Morelos','Nayarit',
  'Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí',
  'Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas'
]

const estadosUS = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming'
]

// Determinar el prefijo basado en el número de whatsapp guardado
const whatsappPrefix = computed(() => {
  if (whatsapp.startsWith('+1')) return 'US'
  return 'MX'
})

const estadosOptions = computed(() =>
  whatsappPrefix.value === 'MX' ? estadosMX : estadosUS
)

async function handleSave() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!name.value || name.value.trim().length < 2) {
    errorMsg.value = 'El nombre debe tener al menos 2 caracteres.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Las contraseñas no coinciden.'
    return
  }
  if (password.value && password.value.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name.value,
        ciudad: ciudad.value,
        estado: estado.value,
        password: password.value || undefined,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      errorMsg.value = data.error || 'Error al guardar.'
      return
    }
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
    password.value = ''
    confirmPassword.value = ''
    successMsg.value = 'Perfil actualizado correctamente.'
  } catch {
    errorMsg.value = 'No se pudo conectar con el servidor.'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="flag-bar"></div>
        <h1 class="auth-title">Mi Perfil</h1>
        <p class="auth-subtitle">Actualiza tus datos o contraseña</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSave" novalidate>
        <div class="field-group">
          <label class="field-label" for="name">Nombre completo</label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="field-input"
            placeholder="Ej: Juan Pérez"
            autocomplete="name"
          />
        </div>

        <div class="field-group">
          <label class="field-label" for="email">Correo electrónico</label>
          <input
            id="email"
            :value="email"
            type="email"
            class="field-input field-input-disabled"
            disabled
          />
        </div>

        <div class="field-group">
          <label class="field-label" for="whatsapp">Número de WhatsApp</label>
          <input
            id="whatsapp"
            :value="whatsapp"
            type="tel"
            class="field-input field-input-disabled"
            disabled
          />
        </div>

        <!-- Ciudad y Estado -->
        <div class="row-two">
          <div class="field-group">
            <label class="field-label" for="ciudad">Ciudad</label>
            <input
              id="ciudad"
              v-model="ciudad"
              type="text"
              class="field-input"
              placeholder="Ej: Monterrey"
            />
          </div>

          <div class="field-group">
            <label class="field-label" for="estado">Estado</label>
            <select id="estado" v-model="estado" class="field-input field-select">
              <option value="" disabled>Selecciona...</option>
              <option v-for="e in estadosOptions" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>
        </div>

        <div class="section-divider">
          <span>Cambiar contraseña <span class="optional">(opcional)</span></span>
        </div>

        <div class="field-group">
          <label class="field-label" for="password">Nueva contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="field-input"
            placeholder="Mínimo 6 caracteres"
            autocomplete="new-password"
          />
        </div>

        <div class="field-group">
          <label class="field-label" for="confirmPassword">Confirmar nueva contraseña</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="field-input"
            placeholder="Repite la nueva contraseña"
            autocomplete="new-password"
          />
        </div>

        <p v-if="errorMsg" class="msg msg-error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="msg msg-success">{{ successMsg }}</p>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Guardando...' : 'Guardar cambios' }}</span>
        </button>

        <button type="button" class="btn-back" @click="goBack">Regresar</button>
      </form>
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
  padding: 1.5rem 2rem 2rem;
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

.field-input::placeholder {
  color: #b0b0c0;
}

.field-input-disabled {
  background: #f0f0f0;
  color: #9a9a9a;
  cursor: not-allowed;
  border-color: #e8e8e8;
}

.field-select {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b6375' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  cursor: pointer;
  padding-right: 2.5rem;
}

.row-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #9a9aaa;
  margin: 0.25rem 0;
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e8e8e8;
}

.optional {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.75rem;
}

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
  margin-top: 1rem;
}

.btn-submit:hover:not(:disabled) {
  background: #00573c;
}

.btn-submit:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-back {
  padding: 0.7rem;
  background: transparent;
  color: #6b6375;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.btn-back:hover {
  border-color: #c0c0c0;
  color: #1a1a2e;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 440px) {
  .row-two {
    grid-template-columns: 1fr;
  }
}
</style>
