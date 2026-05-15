<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '../config'
import { subscribeToPushNotifications } from '../utils/pushNotifications'

const router = useRouter()

const name = ref('')
const email = ref('')
const whatsapp = ref('')
const whatsappPrefix = ref('MX')
const ciudad = ref('')
const estado = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')

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

const estadosOptions = computed(() =>
  whatsappPrefix.value === 'MX' ? estadosMX : estadosUS
)

// Al cambiar de país resetear el estado seleccionado
function onPrefixChange() {
  estado.value = ''
}

// Formatea el número mientras escribe: deja solo dígitos y formatea como (XXX) XXX-XXXX
function formatWhatsapp(e) {
  let digits = e.target.value.replace(/\D/g, '').slice(0, 10)
  let formatted = digits
  if (digits.length > 6) {
    formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  } else if (digits.length > 3) {
    formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`
  } else if (digits.length > 0) {
    formatted = `(${digits}`
  }
  whatsapp.value = formatted
}

const prefixInfo = computed(() => ({
  MX: { flag: '🇲🇽', code: '+52', label: 'MX' },
  US: { flag: '🇺🇸', code: '+1',  label: 'US' },
}[whatsappPrefix.value]))

async function handleRegister() {
  errorMsg.value = ''

  const rawDigits = whatsapp.value.replace(/\D/g, '')

  if (!name.value || !email.value || !whatsapp.value || !password.value || !confirmPassword.value) {
    errorMsg.value = 'Todos los campos son requeridos.'
    return
  }
  if (rawDigits.length !== 10) {
    errorMsg.value = 'El número de WhatsApp debe tener exactamente 10 dígitos.'
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
    const res = await fetch(`${API_BASE_URL}/api/participantes/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        whatsapp: rawDigits,
        whatsapp_prefix: whatsappPrefix.value,
        ciudad: ciudad.value,
        estado: estado.value,
        password: password.value,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      errorMsg.value = data.error || 'Error al registrarse.'
      return
    }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    // Solicitar y suscribir a notificaciones push en segundo plano
    subscribeToPushNotifications().catch(err => console.error('Error requesting push setup:', err))

    const redirectPath = router.currentRoute.value.query.redirect || '/'
    router.push(redirectPath)
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
        <h1 class="auth-title">Crear Cuenta</h1>
        <p class="auth-subtitle">Únete a la Quiniela Mundialista Nova Casa</p>
      </div>

      <form class="auth-form" @submit.prevent="handleRegister" novalidate>
        <!-- Nombre -->
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

        <!-- Email -->
        <div class="field-group">
          <label class="field-label" for="email">Correo electrónico</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="field-input"
            placeholder="correo@ejemplo.com"
            autocomplete="email"
          />
        </div>

        <!-- WhatsApp con selector de bandera -->
        <div class="field-group">
          <label class="field-label" for="whatsapp">Número de WhatsApp</label>
          <div class="phone-row">
            <div class="prefix-selector">
              <button
                type="button"
                class="prefix-btn"
                :class="{ active: whatsappPrefix === 'MX' }"
                @click="whatsappPrefix = 'MX'; onPrefixChange()"
                title="México +52"
              >
                🇲🇽 <span class="prefix-code">+52</span>
              </button>
              <button
                type="button"
                class="prefix-btn"
                :class="{ active: whatsappPrefix === 'US' }"
                @click="whatsappPrefix = 'US'; onPrefixChange()"
                title="Estados Unidos +1"
              >
                🇺🇸 <span class="prefix-code">+1</span>
              </button>
            </div>
            <input
              id="whatsapp"
              :value="whatsapp"
              @input="formatWhatsapp"
              type="tel"
              class="field-input phone-input"
              placeholder="(555) 123-4567"
              autocomplete="tel"
              inputmode="numeric"
              maxlength="14"
            />
          </div>
          <p class="field-hint">
            {{ prefixInfo.flag }} {{ prefixInfo.code }} · Solo 10 dígitos, sin código de país
          </p>
        </div>

        <!-- Ciudad y Estado en fila -->
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

        <!-- Contraseñas -->
        <div class="field-group">
          <label class="field-label" for="password">Contraseña</label>
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
          <label class="field-label" for="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="field-input"
            placeholder="Repite tu contraseña"
            autocomplete="new-password"
          />
        </div>

        <p v-if="errorMsg" class="msg msg-error">{{ errorMsg }}</p>

        <div class="acceptance-msg">
          Al hacer clic en registrarse, declaras conocer y aceptar el 
          <router-link to="/reglas" target="_blank">Reglamento</router-link> y el 
          <router-link to="/privacidad" target="_blank">Aviso de Privacidad</router-link>.
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Registrando...' : 'Crear cuenta' }}</span>
        </button>
      </form>

      <p class="auth-footer">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="auth-link">Inicia sesión</router-link>
      </p>
      <div class="sponsor-footer-strip inside-card">
        <img src="/Tira logos.png?v=2" alt="Patrocinadores Oficiales" class="sponsor-footer-logo" />
      </div>
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
  max-width: 480px;
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
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
}

.field-input:focus {
  border-color: #006847;
  box-shadow: 0 0 0 3px rgba(0, 104, 71, 0.1);
  background: #fff;
}

.field-input::placeholder {
  color: #b0b0c0;
}

.field-select {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b6375' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  cursor: pointer;
}

/* Fila de teléfono */
.phone-row {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.prefix-selector {
  display: flex;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;
  flex-shrink: 0;
}

.prefix-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.6rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.15s;
  border-right: 1px solid #e0e0e0;
  line-height: 1;
}

.prefix-btn:last-child {
  border-right: none;
}

.prefix-btn:hover {
  background: #f0fdf4;
}

.prefix-btn.active {
  background: #006847;
  color: white;
}

.prefix-btn.active .prefix-code {
  color: white;
}

.prefix-code {
  font-size: 0.75rem;
  font-weight: 700;
  color: #4a4a5a;
  letter-spacing: 0.5px;
}

.phone-input {
  flex: 1;
}

.field-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

/* Fila de dos columnas: Ciudad / Estado */
.row-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
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

.acceptance-msg {
  font-size: 0.75rem;
  color: #6b6375;
  line-height: 1.4;
  text-align: center;
  margin-bottom: 0.5rem;
}

.acceptance-msg a {
  color: #006847;
  font-weight: 700;
  text-decoration: underline;
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
  margin-left: 0.25rem;
}

.auth-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .row-two {
    grid-template-columns: 1fr;
  }
  .prefix-btn {
    padding: 0.4rem 0.5rem;
  }
}
</style>
