<script setup>
import { Zap, Trophy, Medal, Award } from 'lucide-vue-next'
</script>

<template>
  <div class="home-landing">
    <img src="/mexico_2026_v2.png" alt="Mexico 2026 Background" class="bg-photo" />

    <div class="hero-container">
      <header class="hero animate-fade-in">
      <div class="hero-content">
        <h1 class="hero-title text-gradient">Vive la Emoción <br><span>Mundialista Nova Casa</span></h1>
        <p class="hero-description">Predice los resultados del escenario más grande del mundo. Desafía a expertos de todo el planeta y gana la gloria eterna (y grandes premios).</p>
        
        <div class="badge-wrapper">
          <div class="badge glass-card">
            <Zap :size="16" class="vibrant-green" />
            <span>FIFA World Cup 2026</span>
          </div>
        </div>

        <div class="hero-link-wrap">
          <router-link to="/quiniela" class="btn-comenzar">COMENZAR</router-link>
          <router-link to="/reglas" class="text-link">leer reglas</router-link>
        </div>
      </div>
      </header>

      <!-- Right Column: Prize Ranking -->
      <aside class="prizes-sidebar animate-fade-in-delayed">
        <div class="prizes-card glass-card">
          <h2 class="prizes-title">Bolsa de Premios</h2>
          
          <div class="prize-item prize-gold">
            <div class="prize-icon-wrap">
              <Trophy :size="40" class="icon-gold" />
            </div>
            <div class="prize-details">
              <h3>$5,000</h3>
              <p>Repartidos en los 1ros lugares</p>
            </div>
            <div class="sponsor-badge">
              <img src="/Vitromex.png" alt="Vitromex" class="sponsor-logo" />
            </div>
          </div>

          <div class="prize-item prize-silver">
            <div class="prize-icon-wrap">
              <Medal :size="40" class="icon-silver" />
            </div>
            <div class="prize-details">
              <h3>$3,000</h3>
              <p>Repartidos en los 2dos lugares</p>
            </div>
            <div class="sponsor-badge">
              <img src="/Daltile.png" alt="Daltile" class="sponsor-logo" />
            </div>
          </div>

          <div class="prize-item prize-bronze">
            <div class="prize-icon-wrap">
              <Award :size="40" class="icon-bronze" />
            </div>
            <div class="prize-details">
              <h3>$2,000</h3>
              <p>Repartidos en los 3ros lugares</p>
            </div>
            <div class="sponsor-badge">
              <img src="/Calorex.png" alt="Calorex" class="sponsor-logo" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.home-landing {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
  z-index: 10;
  position: relative;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 4rem;
  align-items: center;
}

.bg-photo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -3;
}

.hero {
  display: block;
  max-width: 100%;
  width: 100%;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
  background: rgba(255, 255, 255, 0.85);
  padding: 2.5rem;
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
}

.hero-title {
  font-size: clamp(3rem, 8vw, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--text-primary);
}

.hero-title span {
  background: linear-gradient(to right, #006847, #CE1126);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 1.15rem;
  color: var(--text-secondary);
  max-width: 500px;
  line-height: 1.6;
}

.badge-wrapper {
  margin: 0.5rem 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1.25rem;
  border-bottom: 2px solid var(--primary-glow);
  font-size: 0.85rem;
  font-weight: 700;
  width: fit-content;
  color: var(--primary-color);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-link-wrap {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.btn-comenzar {
  background: var(--text-primary);
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 2px;
  text-decoration: none;
  transition: all 0.4s ease;
  border-radius: 0;
  display: inline-block;
  text-align: center;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.btn-comenzar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  background: #006847; /* Mexican Green */
  z-index: -1;
  transition: width 0.4s ease;
}

.btn-comenzar:hover::before {
  width: 100%;
}

.btn-comenzar:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 104, 71, 0.3);
}

.text-link {
  color: var(--text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  position: relative;
  padding-bottom: 4px;
  text-decoration: none;
}

.text-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: #CE1126; /* Mexican Red */
  transition: width 0.3s ease;
}

.text-link:hover {
  color: #CE1126;
}

.text-link:hover::after {
  width: 100%;
}

/* Prizes Sidebar Styles */
.prizes-sidebar {
  width: 100%;
}

.prizes-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  padding: 2rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-radius: 0;
}

.prizes-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 2rem;
  text-align: left;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 1rem;
}

.prize-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.prize-item:last-child {
  margin-bottom: 0;
}

.prize-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
}

.prize-gold::before { background: linear-gradient(to bottom, #FFD700, #FDB931); }
.prize-silver::before { background: linear-gradient(to bottom, #E0E0E0, #9E9E9E); }
.prize-bronze::before { background: linear-gradient(to bottom, #CD7F32, #8B4513); }

.prize-item:hover {
  transform: translateX(8px);
  background: white;
}

.prize-gold:hover { box-shadow: 0 10px 25px rgba(255, 215, 0, 0.2); border-color: rgba(255, 215, 0, 0.4); }
.prize-silver:hover { box-shadow: 0 10px 25px rgba(158, 158, 158, 0.2); border-color: rgba(158, 158, 158, 0.4); }
.prize-bronze:hover { box-shadow: 0 10px 25px rgba(205, 127, 50, 0.2); border-color: rgba(205, 127, 50, 0.4); }

.prize-icon-wrap {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0,0,0,0.03);
  flex-shrink: 0;
}

.icon-gold { color: #FDB931; filter: drop-shadow(0 4px 6px rgba(253, 185, 49, 0.4)); }
.icon-silver { color: #9E9E9E; filter: drop-shadow(0 4px 6px rgba(158, 158, 158, 0.4)); }
.icon-bronze { color: #CD7F32; filter: drop-shadow(0 4px 6px rgba(205, 127, 50, 0.4)); }

.prize-details {
  flex: 1;
}

.prize-details h3 {
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 0.2rem;
  letter-spacing: -1px;
}

.prize-gold h3 { background: linear-gradient(to right, #B8860B, #FDB931); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.prize-silver h3 { background: linear-gradient(to right, #757575, #BDBDBD); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.prize-bronze h3 { background: linear-gradient(to right, #8B4513, #CD7F32); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

.prize-details p {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.3;
}

.sponsor-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 0.5rem; /* Balanced gap from the text on the left */
  padding-right: 1.5rem; /* Pulls the logo inward to give it ample breathing room from the right edge */
  border-left: 1.5px solid var(--border-color); /* Slightly cleaner visual divider */
  height: 44px; /* Optimal height for vertical balance */
  flex-shrink: 0;
}

.sponsor-logo {
  max-height: 32px;
  max-width: 80px;
  object-fit: contain;
  opacity: 0.85; /* Matches general text styling */
  transform: translateY(1px); /* Optical alignment adjustment for the text baseline */
  transition: all 0.3s ease;
}

.sponsor-logo:hover {
  opacity: 1;
  transform: translateY(1px) scale(1.05);
}

.animate-fade-in-delayed {
  animation: fadeIn 0.8s ease forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .hero-content {
    align-items: center;
    text-align: center;
  }
  
  .hero-link-wrap {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .prizes-card {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>
