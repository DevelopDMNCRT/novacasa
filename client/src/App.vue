<script setup>
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'
import { X, Send, CheckCircle, AlertCircle } from 'lucide-vue-next'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const showContactModal = ref(false)
const contactForm = ref({
  name: '',
  email: '',
  message: ''
})
const isSending = ref(false)

const notification = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
})

const showNotification = (type, title, message) => {
  notification.value = { show: true, type, title, message }
}

const handleContactSubmit = async () => {
  if (isSending.value) return
  
  isSending.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactForm.value)
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Error al enviar el mensaje')
    }

    showContactModal.value = false
    contactForm.value = { name: '', email: '', message: '' }
    showNotification('success', '¡Mensaje enviado!', 'Nos pondremos en contacto contigo pronto.')
  } catch (err) {
    console.error('Error al enviar contacto:', err)
    showNotification('error', 'Error al enviar', err.message || 'Hubo un error enviando el mensaje. Inténtalo de nuevo.')
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="app-container">
    <Navbar />
    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    
    <footer class="app-footer">
      <div class="footer-content glass-card">
        <div class="footer-info">
          <h3>Quiniela Mundialista Nova Casa 2026</h3>
          <p>© 2026 Todos los derechos reservados. El juego es para mayores de 18 años.</p>
        </div>
        <div class="footer-links">
          <router-link to="/privacidad">Privacidad</router-link>
          <button @click="showContactModal = true" class="footer-btn">Contacto</button>
        </div>
      </div>
    </footer>

    <!-- CONTACT MODAL -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showContactModal" class="modal-overlay" @click.self="showContactModal = false">
          <div class="contact-modal glass-card animate-scale-up">
            <button class="modal-close" @click="showContactModal = false">
              <X :size="24" />
            </button>
            <div class="modal-header">
              <h2>Contacto</h2>
              <p>Envíanos tus dudas o comentarios y te responderemos a la brevedad.</p>
            </div>
            <form @submit.prevent="handleContactSubmit" class="contact-form">
              <div class="form-group">
                <label>Nombre</label>
                <input type="text" v-model="contactForm.name" required placeholder="Tu nombre" />
              </div>
              <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" v-model="contactForm.email" required placeholder="correo@ejemplo.com" />
              </div>
              <div class="form-group">
                <label>Mensaje</label>
                <textarea v-model="contactForm.message" required placeholder="¿En qué podemos ayudarte?" rows="4"></textarea>
              </div>
              <button type="submit" class="btn-primary btn-send" :disabled="isSending" :style="{ opacity: isSending ? 0.6 : 1 }">
                {{ isSending ? 'ENVIANDO...' : 'ENVIAR MENSAJE' }}
                <Send v-if="!isSending" :size="18" />
              </button>
            </form>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- NOTIFICATION MODAL -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="notification.show" class="modal-overlay" @click.self="notification.show = false">
          <div class="notification-modal glass-card animate-scale-up">
            <div class="noti-icon-wrapper" :class="notification.type">
              <CheckCircle v-if="notification.type === 'success'" :size="44" />
              <AlertCircle v-else :size="44" />
            </div>
            <h3 class="noti-title">{{ notification.title }}</h3>
            <p class="noti-message">{{ notification.message }}</p>
            <button @click="notification.show = false" class="btn-primary btn-noti-close">
              ENTENDIDO
            </button>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style>
/* Global Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}

.app-footer {
  padding: 4rem 2rem 2rem;
  max-width: 1300px;
  margin: 0 auto;
  width: 100%;
}

.footer-content {
  background: #f8fafc;
  padding: 2rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0;
  border: 1px solid var(--border-color);
}

.footer-info h3 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.footer-info p {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a, .footer-btn {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.3s ease;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
}

.footer-links a:hover, .footer-btn:hover {
  color: var(--primary-color);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.contact-modal {
  width: 100%;
  max-width: 500px;
  background: white;
  padding: 3rem;
  border-radius: 1.5rem;
  position: relative;
  border: 1px solid var(--border-color);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: var(--text-secondary);
  transition: color 0.3s;
}

.modal-close:hover {
  color: var(--primary-color);
}

.modal-header h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.modal-header p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.contact-form {
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
  font-size: 0.9rem;
  font-weight: 700;
}

.form-group input, .form-group textarea {
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus, .form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-glow);
}

.btn-send {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
}

/* Notification Modal Styles */
.notification-modal {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 3rem 2.5rem 2.5rem;
  border-radius: 1.5rem;
  text-align: center;
  border: 1px solid var(--border-color);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.noti-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.noti-icon-wrapper.success {
  background: rgba(0, 104, 71, 0.1);
  color: #006847;
}

.noti-icon-wrapper.error {
  background: rgba(206, 17, 38, 0.1);
  color: #CE1126;
}

.noti-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.noti-message {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.btn-noti-close {
  width: 100%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  letter-spacing: 1px;
}

/* Animations */
.animate-scale-up {
  animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
    padding: 2rem;
  }
}
</style>
