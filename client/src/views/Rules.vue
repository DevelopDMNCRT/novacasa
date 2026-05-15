<script setup>
import { 
  ShieldCheck, 
  Target, 
  Trophy, 
  Clock, 
  Users, 
  Info,
  HelpCircle,
  Zap
} from 'lucide-vue-next'
</script>

<template>
  <div class="rules-view animate-fade-in">
    <div class="view-header">
      <div class="header-content">
        <span class="badge">REGLAMENTO OFICIAL</span>
        <h1 class="view-title">Reglas de la <span class="text-green">Qui</span>niela</h1>
        <p class="view-subtitle">Demuestra tu conocimiento futbolístico y compite por el primer lugar. Aquí tienes todo lo que necesitas saber para participar.</p>
      </div>
    </div>

    <div class="rules-container">
      <!-- MAIN DYNAMICS -->
      <section class="rules-section">
        <div class="section-title">
          <Info :size="20" />
          <h2>Dinámica del Concurso</h2>
        </div>
        <div class="rules-grid">
          <div class="rule-card glass-card">
            <div class="card-icon-wrapper blue">
              <Users :size="24" />
            </div>
            <h3>1. Registro y Participación</h3>
            <p>La participación es personal e intransferible. Cada usuario debe registrarse con datos reales para poder reclamar premios. Se permite únicamente <strong>una cuenta por persona</strong>.</p>
          </div>

          <div class="rule-card glass-card">
            <div class="card-icon-wrapper green">
              <Zap :size="24" />
            </div>
            <h3>2. Fases de Predicción</h3>
            <p>La quiniela se divide en dos etapas críticas:</p>
            <ul class="rule-list">
              <li><strong>Fase 1:</strong> Predicción de resultados de la Fase de Grupos.</li>
              <li><strong>Fase 2:</strong> Predicción de partidos de 16vos y selección del Campeón.</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- SCORING SYSTEM -->
      <section class="rules-section">
        <div class="section-title">
          <Target :size="20" />
          <h2>Sistema de Puntuación</h2>
        </div>
        <div class="scoring-container glass-card">
          <div class="scoring-item">
            <div class="score-value">+2</div>
            <div class="score-info">
              <h4>Resultado Exacto</h4>
              <p>Si aciertas el número de goles de ambos equipos correctamente.</p>
              <span class="example">Ej: Predicción 2-1 | Resultado 2-1</span>
            </div>
          </div>
          <div class="scoring-divider"></div>
          <div class="scoring-item">
            <div class="score-value">+1</div>
            <div class="score-info">
              <h4>Tendencia (Ganador/Empate)</h4>
              <p>Si aciertas quién gana o si hay empate, pero no el marcador exacto.</p>
              <span class="example">Ej: Predicción 1-0 | Resultado 3-0</span>
            </div>
          </div>
          <div class="scoring-divider"></div>
          <div class="scoring-item">
            <div class="score-value">+3</div>
            <div class="score-info">
              <h4>Campeón del Torneo</h4>
              <p>Puntos extra si tu equipo seleccionado levanta la copa al final del mundial.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- DEADLINES -->
      <section class="rules-section">
        <div class="section-title">
          <Clock :size="20" />
          <h2>Tiempos Límite</h2>
        </div>
        <div class="deadlines-grid">
          <div class="deadline-card glass-card">
            <Clock :size="20" class="icon" />
            <div class="deadline-text">
              <strong>Límite por Partido:</strong> Los pronósticos deben registrarse al menos <strong>1 hora antes</strong> del inicio de cada encuentro. Una vez pasado este tiempo, el sistema bloqueará cualquier modificación.
            </div>
          </div>
          <div class="deadline-card glass-card">
            <Trophy :size="20" class="icon" />
            <div class="deadline-text">
              <strong>Elección de Campeón:</strong> Se cierra 1 hora antes del inicio del último partido de la fase de 16vos.
            </div>
          </div>
        </div>
      </section>

      <!-- AWARDS -->
      <div class="awards-banner glass-card">
        <div class="card-icon-wrapper emerald">
          <Trophy :size="24" />
        </div>
        <div class="awards-content">
          <h3>Premiación y Empates</h3>
          <p>Al finalizar el torneo, se premiará a los usuarios con mayor puntaje acumulado en los tres primeros lugares. En caso de <strong>empate en puntos</strong> en cualquiera de las posiciones (1°, 2° o 3°), el premio correspondiente se <strong>dividirá equitativamente</strong> entre la cantidad de personas que ocupen dicho lugar.</p>
          <div class="award-note">
            <Info :size="16" />
            <span>Los premios serán entregados en <strong>efectivo</strong> una vez finalizada la Copa del Mundo.</span>
          </div>
        </div>
      </div>

      <!-- FAIR PLAY -->
      <div class="fair-play-banner glass-card">
        <ShieldCheck :size="32" class="text-green" />
        <div class="fair-play-content">
          <h3>Compromiso Juego Limpio</h3>
          <p>Cualquier intento de manipular el sistema o crear cuentas duplicadas resultará en la descalificación inmediata sin derecho a reclamo. Los administradores tienen la palabra final.</p>
        </div>
      </div>

      <div class="sponsor-footer-strip">
        <img src="/Tira logos.png?v=2" alt="Patrocinadores Oficiales" class="sponsor-footer-logo" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.rules-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 8rem 2rem 6rem;
  min-height: 100vh;
}

.view-header {
  text-align: center;
  margin-bottom: 5rem;
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

.text-green {
  color: var(--primary-color);
}

.view-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.rules-container {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.rules-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
}

.section-title h2 {
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}

.rules-grid, .secondary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.rule-card {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: all 0.3s ease;
  border-radius: 1rem;
}

.rule-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary-color);
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
}

.card-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.card-icon-wrapper.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.card-icon-wrapper.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.card-icon-wrapper.amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.card-icon-wrapper.emerald { background: rgba(5, 150, 105, 0.1); color: #059669; }

.rule-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.rule-card p {
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

/* AWARDS BANNER */
.awards-banner {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  padding: 3rem;
  border-radius: 1.5rem;
  border-left: 4px solid #10b981;
}

.awards-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.awards-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.awards-content p {
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

.award-note {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  background: var(--surface-color);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  width: fit-content;
}

.award-note span strong {
  color: var(--primary-color);
}

.rule-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rule-list li {
  display: block;
  position: relative;
  padding-left: 1.5rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.rule-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: 900;
}

.rule-list li strong {
  white-space: nowrap;
  color: var(--text-primary);
}

/* SCORING STYLES */
.scoring-container {
  display: flex;
  padding: 2rem;
  border-radius: 1.5rem;
}

.scoring-item {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1rem;
}

.score-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary-color);
  font-family: 'Outfit', sans-serif;
  line-height: 1;
}

.score-info h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.score-info p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.example {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--surface-color);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

.scoring-divider {
  width: 1px;
  background: var(--border-color);
  margin: 0 1rem;
}

/* DEADLINES */
.deadlines-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.deadline-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 1rem;
}

.deadline-card .icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.deadline-text {
  color: var(--text-secondary);
  font-size: 1.05rem;
}

/* FAIR PLAY BANNER */
.fair-play-banner {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  padding: 3rem;
  border-radius: 1.5rem;
  background: linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent);
  border-left: 4px solid var(--primary-color);
}

.fair-play-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.fair-play-content p {
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 900px) {
  .scoring-container {
    flex-direction: column;
    gap: 2rem;
  }
  .scoring-divider {
    width: 100%;
    height: 1px;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .view-title {
    font-size: 2.5rem;
  }
  .rules-grid, .secondary-grid, .deadlines-grid {
    grid-template-columns: 1fr;
  }
  .fair-play-banner {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  .rules-view {
    padding: 6rem 1.5rem 4rem;
  }
}
</style>
