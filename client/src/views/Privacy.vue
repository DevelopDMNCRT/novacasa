<script setup>
import { ShieldCheck, Eye, Lock, FileText, UserCheck, MessageSquare } from 'lucide-vue-next'
</script>

<template>
  <div class="privacy-view animate-fade-in">
    <div class="view-header">
      <div class="header-content">
        <span class="badge">LEGAL</span>
        <h1 class="view-title">Aviso de Privacidad</h1>
        <p class="view-subtitle">Cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).</p>
      </div>
    </div>

    <div class="privacy-content glass-card">
      <div class="privacy-sections">
        
        <section class="privacy-section">
          <div class="section-icon">
            <UserCheck :size="20" />
          </div>
          <div class="section-text">
            <h2>1. Identidad y Domicilio del Responsable</h2>
            <p>
              El responsable del tratamiento de sus datos personales es <strong>Quiniela Nova Casa</strong>, con domicilio para oír y recibir notificaciones el relacionado con la administración de este sitio web. Nos comprometemos a que la información personal que recabamos sea tratada bajo los principios de licitud, consentimiento, información, calidad, finalidad, lealtad, proporcionalidad y responsabilidad.
            </p>
          </div>
        </section>

        <section class="privacy-section">
          <div class="section-icon">
            <Eye :size="20" />
          </div>
          <div class="section-text">
            <h2>2. Datos Personales que Recabamos</h2>
            <p>Para las finalidades señaladas en el presente aviso, recabamos los siguientes datos personales de identificación:</p>
            <ul>
              <li>Nombre completo</li>
              <li>Nombre de usuario</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono (WhatsApp)</li>
              <li>Contraseña (almacenada de forma encriptada)</li>
            </ul>
          </div>
        </section>

        <section class="privacy-section">
          <div class="section-icon">
            <FileText :size="20" />
          </div>
          <div class="section-text">
            <h2>3. Finalidades del Tratamiento</h2>
            <p>Sus datos personales serán utilizados para las siguientes finalidades primarias:</p>
            <ul>
              <li>Registro y gestión de su cuenta en la plataforma.</li>
              <li>Participación en la Quiniela Mundialista 2026.</li>
              <li>Validación de identidad para la entrega de premios en efectivo.</li>
              <li>Notificaciones sobre el estatus de sus pronósticos y resultados.</li>
              <li>Uso de sus datos para <strong>campañas de mercadotecnia</strong>, promociones e información sobre futuros eventos o productos.</li>
              <li>Atención a dudas, quejas y sugerencias.</li>
            </ul>
          </div>
        </section>

        <section class="privacy-section">
          <div class="section-icon">
            <Lock :size="20" />
          </div>
          <div class="section-text">
            <h2>4. Derechos ARCO</h2>
            <p>
              Usted tiene derecho a conocer qué datos personales tenemos de usted (Acceso), solicitar la corrección de su información personal (Rectificación), que la eliminemos de nuestros registros o bases de datos (Cancelación) u oponerse al uso de sus datos para fines específicos (Oposición).
            </p>
            <p>Para el ejercicio de cualquiera de los derechos ARCO, usted deberá enviar una solicitud a través de nuestra sección de contacto o al administrador de la plataforma.</p>
          </div>
        </section>

        <section class="privacy-section">
          <div class="section-icon">
            <ShieldCheck :size="20" />
          </div>
          <div class="section-text">
            <h2>5. Transferencias de Datos</h2>
            <p>
              Le informamos que sus datos personales no serán compartidos con ninguna autoridad, empresa, organización o persona distinta a nosotros, salvo por requerimiento legal expreso o para las finalidades estrictamente necesarias para el desarrollo del concurso (como la gestión de pagos).
            </p>
          </div>
        </section>

        <section class="privacy-section">
          <div class="section-icon">
            <MessageSquare :size="20" />
          </div>
          <div class="section-text">
            <h2>6. Cambios al Aviso de Privacidad</h2>
            <p>
              El presente aviso de privacidad puede sufrir modificaciones o actualizaciones derivadas de nuevos requerimientos legales o de nuestras propias necesidades. Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso de privacidad, a través de actualizaciones publicadas en esta misma sección.
            </p>
          </div>
        </section>

      </div>

      <div class="privacy-footer">
        <p>Última actualización: 10 de Mayo de 2026</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.privacy-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 8rem 2rem 6rem;
  min-height: 100vh;
}

.view-header {
  text-align: center;
  margin-bottom: 4rem;
}

.badge {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background: var(--primary-glow);
  color: var(--primary-color);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
  border-radius: 50px;
  margin-bottom: 1.5rem;
}

.view-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.view-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.privacy-content {
  padding: 4rem;
  border-radius: 1.5rem;
}

.privacy-sections {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.privacy-section {
  display: flex;
  gap: 2rem;
}

.section-icon {
  width: 48px;
  height: 48px;
  background: var(--surface-color);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.section-text h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.section-text p {
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 1rem;
}

.section-text ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-text li {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-text li::before {
  content: "•";
  color: var(--primary-color);
  font-weight: 900;
}

.privacy-footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .privacy-content {
    padding: 2rem;
  }
  .privacy-section {
    flex-direction: column;
    gap: 1rem;
  }
  .view-title {
    font-size: 2.5rem;
  }
}
</style>
