<script setup>
import { ref, onMounted, computed } from 'vue'
import { Trophy, CheckCircle, ChevronRight, Star, Pencil } from 'lucide-vue-next'
import { subscribeToPushNotifications } from '../utils/pushNotifications'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'


const matchSchedule = [
  // JORNADA 1
  { id: 1, jornada: '1', date: 'Jun 11', home: 'México', away: 'Sudáfrica', homeLogo: 'mx', awayLogo: 'za' },
  { id: 2, jornada: '1', date: 'Jun 12', home: 'Estados Unidos', away: 'Paraguay', homeLogo: 'us', awayLogo: 'py' },
  { id: 3, jornada: '1', date: 'Jun 13', home: 'Brasil', away: 'Marruecos', homeLogo: 'br', awayLogo: 'ma' },
  { id: 4, jornada: '1', date: 'Jun 16', home: 'Argentina', away: 'Argelia', homeLogo: 'ar', awayLogo: 'dz' },
  { id: 5, jornada: '1', date: 'Jun 17', home: 'Portugal', away: 'RD Congo', homeLogo: 'pt', awayLogo: 'cd' },
  { id: 6, jornada: '1', date: 'Jun 17', home: 'Inglaterra', away: 'Croacia', homeLogo: 'gb-eng', awayLogo: 'hr' },
  
  // JORNADA 2
  { id: 7, jornada: '2', date: 'Jun 18', home: 'México', away: 'Corea del Sur', homeLogo: 'mx', awayLogo: 'kr' },
  { id: 8, jornada: '2', date: 'Jun 19', home: 'Brasil', away: 'Haití', homeLogo: 'br', awayLogo: 'ht' },
  { id: 9, jornada: '2', date: 'Jun 20', home: 'Países Bajos', away: 'Suecia', homeLogo: 'nl', awayLogo: 'se' },
  { id: 10, jornada: '2', date: 'Jun 20', home: 'Alemania', away: 'Costa Marfil', homeLogo: 'de', awayLogo: 'ci' },
  { id: 11, jornada: '2', date: 'Jun 21', home: 'España', away: 'Arabia Saudita', homeLogo: 'es', awayLogo: 'sa' },
  { id: 12, jornada: '2', date: 'Jun 22', home: 'Argentina', away: 'Austria', homeLogo: 'ar', awayLogo: 'at' },

  // JORNADA 3
  { id: 13, jornada: '3', date: 'Jun 24', home: 'República Checa', away: 'México', homeLogo: 'cz', awayLogo: 'mx' },
  { id: 14, jornada: '3', date: 'Jun 24', home: 'Escocia', away: 'Brasil', homeLogo: 'gb-sct', awayLogo: 'br' },
  { id: 15, jornada: '3', date: 'Jun 26', home: 'Uruguay', away: 'España', homeLogo: 'uy', awayLogo: 'es' },
  { id: 16, jornada: '3', date: 'Jun 26', home: 'Noruega', away: 'Francia', homeLogo: 'no', awayLogo: 'fr' },
  { id: 17, jornada: '3', date: 'Jun 27', home: 'Colombia', away: 'Portugal', homeLogo: 'co', awayLogo: 'pt' },
  { id: 18, jornada: '3', date: 'Jun 27', home: 'Jordania', away: 'Argentina', homeLogo: 'jo', awayLogo: 'ar' },
]

const predictions = ref(matchSchedule.map(m => ({
  ...m,
  prediction: 'Pendiente',
  status: 'Sin completar'
})))
const totalMatches = ref(matchSchedule.length)
const completedMatches = ref(0)
const championName = ref('N/D')

// Same ID→name map used in Quiniela.vue r16Teams
const r16TeamsMap = {
  1:  { name: 'Corea del Sur', logo: 'kr' },
  2:  { name: 'México',        logo: 'mx' },
  3:  { name: 'Brasil',        logo: 'br' },
  4:  { name: 'Marruecos',     logo: 'ma' },
  5:  { name: 'Argentina',     logo: 'ar' },
  6:  { name: 'Argelia',       logo: 'dz' },
  7:  { name: 'Alemania',      logo: 'de' },
  8:  { name: 'Países Bajos',  logo: 'nl' },
  9:  { name: 'España',        logo: 'es' },
  10: { name: 'Croacia',       logo: 'hr' },
  11: { name: 'Inglaterra',    logo: 'gb-eng' },
  12: { name: 'Uruguay',       logo: 'uy' },
  13: { name: 'Portugal',      logo: 'pt' },
  14: { name: 'Francia',       logo: 'fr' },
  15: { name: 'Escocia',       logo: 'gb-sct' },
  16: { name: 'Austria',       logo: 'at' },
}
const championLogo = ref('')

const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    // Fetch matches and predictions in parallel
    const [matchesRes, predsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/matches`),
      fetch(`${API_BASE_URL}/api/predictions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])
    
    if (matchesRes.ok && predsRes.ok) {
      const matchesData = await matchesRes.json()
      const predsData = await predsRes.json()
      const userPreds = predsData.predictions || []

      if (!Array.isArray(matchesData)) {
        console.warn('matchesData is not an array:', matchesData)
        return
      }

      predictions.value = (matchesData || []).map(match => {
        if (!match) return null;
        const found = userPreds.find(p => p && p.match_id === match.id)
        
        // Format real result
        let realResult = 'Pendiente'
        if (match.home_score_real !== undefined && match.home_score_real !== null && 
            match.away_score_real !== undefined && match.away_score_real !== null) {
          realResult = `${match.home_score_real} - ${match.away_score_real}`
        }

        return {
          id: match.id || Math.random(),
          jornada: match.jornada || '?',
          date: match.date_text || '',
          home: match.home_team || '?',
          away: match.away_team || '?',
          homeLogo: match.home_logo || '',
          awayLogo: match.away_logo || '',
          prediction: found ? `${found.home_score} - ${found.away_score}` : 'Pendiente',
          realResult: realResult,
          status: found ? 'Guardado' : 'Sin completar'
        }
      }).filter(p => p !== null)

            // Correct counts to reflect only In-Scope Quiniela matches (Groups + R16)
      const inScopeMatches = matchesData.filter(m => m && ['1','2','3','R16'].includes(m.jornada));
      totalMatches.value = inScopeMatches.length + 1; // +1 for Champion choice
      
      const inScopeIds = inScopeMatches.map(m => m.id);
      completedMatches.value = userPreds.filter(p => p && inScopeIds.includes(p.match_id)).length;

      // Show champion name
      const cid = predsData.champion_id
      // Show champion name and set logo
      const teamObj = (cid && r16TeamsMap[cid]);
      if (teamObj && typeof teamObj === 'object') {
         championName.value = teamObj.name || 'N/D';
         championLogo.value = teamObj.logo || '';
      } else {
         championName.value = (teamObj && typeof teamObj === 'string') ? teamObj : 'N/D';
         championLogo.value = ''; 
      }
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
  }
}

const groupPredictions = computed(() => predictions.value.filter(p => p.jornada === '1' || p.jornada === '2' || p.jornada === '3'))
const knockoutPredictions = computed(() => predictions.value.filter(p => p.jornada === 'R16'))

onMounted(() => {
  fetchDashboardData()
  // Solicitar permisos e inicializar suscripción Push de forma discreta
  subscribeToPushNotifications().catch(err => console.error('Push setup failed on dashboard mount:', err))
})
</script>

<template>
  <div class="dashboard-view animate-fade-in">
    <div class="view-header">
      <div class="header-main">
        <h1 class="view-title">Mis Pronósticos</h1>
        <p class="view-subtitle">Revisa el historial de tus predicciones para la Copa del Mundo 2026.</p>
      </div>
      
      <div class="stats-cards">
        <div class="stat-card glass-card">
          <Trophy :size="20" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-value">{{ completedMatches }} / {{ totalMatches }}</span>
            <span class="stat-label">Predicciones Completas</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <Star :size="20" class="stat-icon stat-icon-champion" />
          <div class="stat-content">
            <span class="stat-value">{{ championName }}</span>
            <span class="stat-label">Campeón Seleccionado</span>
          </div>
        </div>
      </div>
    </div>

    <h2 class="section-heading">Fase de Grupos</h2>
    <!-- Predictions Table -->
    <div class="table-container glass-card">
      <table class="predictions-table">
        <thead>
          <tr>
            <th>JORNADA</th>
            <th class="desktop-only">FECHA</th>
            <th>PARTIDO</th>
            <th class="text-center">PRONÓSTICO</th>
            <th class="text-center">RESULTADO</th>
            <th class="text-right">ESTADO</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pred in groupPredictions" :key="pred.id" class="table-row">
            <td class="jornada-cell">
              <span class="jornada-badge">{{ pred.jornada }}</span>
            </td>
            <td class="date-cell-wrapper">
              <div class="date-cell">
                <span>{{ pred.date }}</span>
              </div>
            </td>
            <td class="match-cell-wrapper">
              <div class="match-cell">
                <div class="team">
                  <img :src="`https://flagcdn.com/w40/${pred.homeLogo}.png`" :alt="pred.home" class="flag">
                  <span class="team-name desktop-only">{{ pred.home }}</span>
                </div>
                <span class="vs">-</span>
                <div class="team">
                  <span class="team-name desktop-only">{{ pred.away }}</span>
                  <img :src="`https://flagcdn.com/w40/${pred.awayLogo}.png`" :alt="pred.away" class="flag">
                </div>
              </div>
            </td>
            <td class="text-center">
              <span class="prediction-value">{{ pred.prediction }}</span>
            </td>
            <td class="text-center">
              <span class="real-result-value" :class="{ 'pending': pred.realResult === 'Pendiente' }">
                {{ pred.realResult }}
              </span>
            </td>
            <td class="text-right">
              <div 
                class="status-cell clickable" 

                @click="$router.push(`/quiniela?jornada=${pred.jornada}`)"
              >
                <Pencil :size="16" class="status-icon" />
                <span>Jugar</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

        <h2 v-if="false" class="section-heading mt-section">Dieciseisavos de Final</h2>
    <div v-if="false" class="table-container glass-card">
      <table class="predictions-table">
        <thead>
          <tr>
            <th>ETAPA</th>
            <th class="desktop-only">FECHA</th>
            <th>PARTIDO</th>
            <th class="text-center">PRONÓSTICO</th>
            <th class="text-center">RESULTADO</th>
            <th class="text-right">ESTADO</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pred in knockoutPredictions" :key="pred.id" class="table-row">
            <td class="jornada-cell">
              <span class="jornada-badge knockout-jornada">16VOS</span>
            </td>
            <td class="date-cell-wrapper">
              <div class="date-cell">
                <span>{{ pred.date }}</span>
              </div>
            </td>
            <td class="match-cell-wrapper">
              <div class="match-cell">
                <div class="team">
                  <img :src="`https://flagcdn.com/w40/${pred.homeLogo}.png`" :alt="pred.home" class="flag">
                  <span class="team-name desktop-only">{{ pred.home }}</span>
                </div>
                <span class="vs">-</span>
                <div class="team">
                  <span class="team-name desktop-only">{{ pred.away }}</span>
                  <img :src="`https://flagcdn.com/w40/${pred.awayLogo}.png`" :alt="pred.away" class="flag">
                </div>
              </div>
            </td>
            <td class="text-center">
              <span class="prediction-value">{{ pred.prediction }}</span>
            </td>
            <td class="text-center">
              <span class="real-result-value" :class="{ 'pending': pred.realResult === 'Pendiente' }">
                {{ pred.realResult }}
              </span>
            </td>
            <td class="text-right">
              <div 
                class="status-cell clickable"
                @click="$router.push('/quiniela')"
              >
                <CheckCircle :size="16" class="status-icon" />
                <span class="desktop-only">{{ pred.status }}</span>
              </div>
            </td>
          </tr>
          <tr v-if="!knockoutPredictions.length">
             <td colspan="6" class="text-center" style="padding: 3rem; color: var(--text-secondary);">
               Aún no has cargado predicciones para Dieciseisavos de Final.
             </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- CHAMPION IN LIST FORMAT -->
    <h2 class="section-heading mt-section" v-if="championName !== 'N/D'">Campeón del Mundo</h2>
    <div class="table-container glass-card" style="margin-bottom: 4rem;" v-if="championName !== 'N/D'">
      <table class="predictions-table">
        <tbody>
          <tr class="table-row">
            <td class="jornada-cell">
              <span class="jornada-badge" style="background: #fef08a; color: #854d0e;">FINAL</span>
            </td>
            <td class="date-cell-wrapper">
              <div class="date-cell"><span>19 de Julio, 2026</span></div>
            </td>
            <td class="match-cell-wrapper">
              <div class="match-cell" style="justify-content: flex-start; gap: 1rem;">
                <Trophy :size="18" class="text-yellow-500" style="color: #eab308;" />
                <div class="team" style="flex: unset;">
                  <img :src="`https://flagcdn.com/w40/${championLogo}.png`" class="flag">
                  <span class="team-name desktop-only">{{ championName }}</span>
                </div>
              </div>
            </td>
            <td class="text-center">
              <span class="prediction-value">Predicción Final</span>
            </td>
            <td class="text-center">
              <span class="real-result-value pending">Por definir</span>
            </td>
            <td class="text-right">
              <div class="status-cell clickable" @click="$router.push('/quiniela')">
                <Pencil :size="16" class="status-icon" />
                <span>Jugar</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="sponsor-footer-strip">
      <img src="/Tira logos.png?v=2" alt="Patrocinadores Oficiales" class="sponsor-footer-logo" />
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  max-width: 1300px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
  min-height: 100vh;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 4rem;
  gap: 2rem;
}

.view-title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.view-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.stats-cards {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 2.5rem;
  border-left: 4px solid var(--primary-color);
}

.stat-icon {
  color: var(--primary-color);
}

.stat-icon-champion {
  color: #CE1126;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Sections */
.section-heading {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  padding-left: 1rem;
  border-left: 4px solid var(--primary-color);
}

.mt-section {
  margin-top: 4rem;
}

/* Table Styles */
.table-container {
  padding: 1rem;
  overflow-x: auto;
}

.predictions-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 0.75rem;
  min-width: 800px;
}

.predictions-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.table-row {
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.table-row:hover {
  background: white;
  transform: scale(1.005);
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.table-row td {
  padding: 1.25rem 1.5rem;
  vertical-align: middle;
}

.table-row td:first-child { border-radius: 8px 0 0 8px; }
.table-row td:last-child { border-radius: 0 8px 8px 0; }

.jornada-badge {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 0.4rem 0.8rem;
  font-weight: 700;
  font-size: 0.85rem;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
}

.date-icon { color: var(--primary-color); }

.match-cell {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.team {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 140px;
}

.flag {
  width: 28px;
  height: 20px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.team-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.vs {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  opacity: 0.5;
}

.prediction-value {
  background: var(--text-primary);
  color: white;
  padding: 0.5rem 1.25rem;
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 2px;
}

.real-result-value {
  background: #f0fdf4; /* Light green background for result */
  color: #006847;
  padding: 0.5rem 1.25rem;
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 2px;
  border: 1px solid #dcfce7;
}

.real-result-value.pending {
  background: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
}

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 0.85rem;
}

.clickable {
  cursor: pointer;
  transition: all 0.2s;
}

.clickable:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.status-pending {
  color: #CE1126; /* Mexican Red for attention */
}

.text-center { text-align: center !important; }
.text-right { text-align: right !important; }

/* Bracket Styles */
.bracket-container {
  padding: 2rem;
  overflow-x: auto;
  margin-bottom: 2rem;
}

.tournament-bracket {
  display: flex;
  justify-content: space-between;
  min-width: 1000px;
  gap: 1rem;
}

.bracket-half {
  display: flex;
  gap: 2rem;
  flex: 1;
}

.bracket-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
}

.bracket-round {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 1rem;
}

.bracket-match {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: 250px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.bracket-match:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.08);
}

.bracket-match.empty {
  opacity: 0.6;
}

.bracket-team {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.85rem;
  font-weight: 600;
}

.bracket-team:last-child {
  border-bottom: none;
}

.bracket-team img {
  width: 20px;
  height: 15px;
  object-fit: cover;
  margin-right: 0.5rem;
  border-radius: 2px;
}

.bracket-team .right-flag {
  margin-right: 0;
  margin-left: 0.5rem;
}

.bracket-team span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bracket-team .right-name {
  text-align: right;
}

.scores-wrapper {
   display: flex;
   gap: 0.25rem;
   margin-left: auto;
}

.scores-wrapper.right-score {
   margin-left: 0;
   margin-right: auto;
}

.score-pill {
   font-size: 0.7rem;
   font-weight: 800;
   padding: 0.1rem 0.4rem;
   border-radius: 4px;
   display: flex;
   align-items: center;
   white-space: nowrap;
}

.user-pill {
   background: #0f172a;
   color: #ffffff;
   border: 1px solid #020617;
}

.real-pill {
   background: #f0fdf4;
   color: #166534;
   border: 1px solid #bbf7d0;
}

.round-title {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.final-match {
  width: 260px;
  transform: scale(1.05);
  margin-bottom: 2rem;
  border: 2px solid var(--primary-color);
}

.champion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, rgba(0,104,71,0.05) 0%, rgba(206,17,38,0.05) 100%);
  padding: 1.5rem 2.5rem;
  border-radius: 12px;
  border: 1px solid rgba(0,104,71,0.2);
  margin-top: 1rem;
}

.champion-card h4 {
  font-size: 0.9rem;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.champion-name {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary-color);
}

/* CHAMPION SUMMARY STYLING */
.champion-summary-container {
  margin-top: 4rem;
  display: flex;
  justify-content: center;
}

.champion-reveal-card {
  background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
  color: white;
  width: 100%;
  max-width: 700px;
  padding: 3rem;
  display: flex;
  gap: 2.5rem;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.champion-reveal-card::after {
  content: "";
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.champ-icon-circle {
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 10px 30px rgba(234, 179, 8, 0.3);
  color: #0f172a;
}

.champ-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.champ-tag {
  font-size: 0.75rem;
  letter-spacing: 3px;
  font-weight: 800;
  color: #eab308;
  text-transform: uppercase;
}

.champ-header {
  font-size: 1.75rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.5px;
}

.champ-identity {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  width: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.star-badge {
  color: #eab308;
  filter: drop-shadow(0 0 8px rgba(234, 179, 8, 0.5));
}

.champion-winner-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
}

.knockout-jornada {
  background: #fee2e2 !important;
  color: #991b1b !important;
}

.mt-section {
  margin-top: 4rem;
}

/* RESPONSIVE FIXES */
@media (max-width: 1024px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }
  
  .stats-cards {
    width: 100%;
  }
  
  .stat-card {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: 6rem 1rem 2rem;
  }
  
  .view-header {
    margin-bottom: 2rem;
  }
  
  .view-title {
    font-size: 2rem;
  }
  
  .predictions-table {
    min-width: 700px !important; /* Allow meaningful side scrolling without breakage */
  }
  
  .table-row td {
    padding: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .champion-reveal-card {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
    padding: 2rem;
  }
  
  .champ-identity {
    margin: 0.5rem auto 0;
  }
}

/* ============================================
   MOBILE CARD VIEW TRANSFORM (Avoids sideways scroll)
   ============================================ */
@media (max-width: 768px) {
  /* Prevent horizontal bleed */
  .table-container {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    overflow-x: hidden !important; 
    margin-bottom: 2rem !important;
  }
  
  /* Destroy table behaviors, convert to blocks */
  .predictions-table, 
  .predictions-table tbody, 
  .predictions-table tr, 
  .predictions-table td {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important; 
    box-sizing: border-box !important;
  }
  
  .predictions-table thead {
    display: none !important; /* Hide header labels completely */
  }
  
  .table-row {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 16px !important;
    padding: 1.5rem !important;
    margin-bottom: 1.5rem !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04) !important;
    transform: none !important; /* Stop hover scaling on touch */
    display: flex !important;
    flex-direction: column !important;
    gap: 1.25rem !important;
  }
  
  .table-row:hover {
    transform: none !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04) !important;
  }
  
  /* Header segment of the card */
  .table-row td:first-child, 
  .table-row td:last-child {
    border-radius: 0 !important; 
  }

  .jornada-cell, .date-cell-wrapper {
    padding: 0 !important;
    text-align: center !important;
  }
  
  .jornada-cell {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-bottom: 1px solid #f1f5f9 !important;
    padding-bottom: 0.75rem !important;
  }
  
  /* Move date right into the header row visually */
  .jornada-cell::after {
    content: "PARTIDO";
    font-size: 0.65rem;
    letter-spacing: 1.5px;
    font-weight: 800;
    color: #94a3b8;
  }

  .date-cell-wrapper {
    display: none !important; /* Hide secondary date stack if desired, or leave it simple */
  }

  /* Visual Matching Segment: Home vs Away horizontally stacked nicely */
  .match-cell-wrapper {
    padding: 0 !important;
  }
  
  .match-cell {
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
    width: 100% !important;
    gap: 0.5rem !important;
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
  }
  
  .team {
    flex: 1;
    flex-direction: column !important;
    align-items: center !important;
    gap: 0.5rem !important;
    min-width: 0 !important;
    text-align: center;
  }
  
  .team-name {
    font-size: 0.85rem !important;
    white-space: normal !important; /* Allow wrapping for long team names on vertical stack */
    line-height: 1.2 !important;
    display: block !important; /* FORCE DISPLAY OVER desktop-only */
  }
  
  .vs {
    font-size: 0.6rem;
    margin: 0 0.25rem;
  }
  
  .flag {
    width: 32px !important;
    height: 24px !important;
  }

  /* SCORING DISPLAY SEGMENT */
  .table-row .text-center {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 1rem !important;
    padding: 0 !important;
  }

  /* Re-distribute individual score cells */
  /* Because in JS/HTML they are two adjacent <td> tags both class text-center */
  /* We stack them side by side */
  
  /* Trick: Select BOTH score cells and give them descriptive labels */
  .table-row td:nth-of-type(4), 
  .table-row td:nth-of-type(5) {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    flex: 1;
    gap: 0.5rem;
  }
  
  /* We will re-enable side-by-side containment for BOTH score cells */
  .table-row td:nth-of-type(4) {
    border-top: 1px solid transparent; /* Placeholder to identify */
  }

  /* Wrapper setup for grouping values */
  .prediction-value, .real-result-value {
    width: 100% !important;
    text-align: center !important;
    box-sizing: border-box !important;
    padding: 0.75rem 0 !important;
    border-radius: 6px !important;
  }

  /* Label Injection via before pseudo elements */
  .table-row td:nth-of-type(4)::before {
    content: "TU PRONÓSTICO";
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 1px;
    color: #64748b;
  }
  
  .table-row td:nth-of-type(5)::before {
    content: "RESULTADO REAL";
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 1px;
    color: #64748b;
  }

  /* Custom Grid Row for the two Score Cells Together */
  .table-row {
     /* Re-defining flex alignment to allow row splits */
  }
  
  /* Bottom Action/Status section */
  .table-row td:last-child {
    padding: 0.75rem 0 0 !important;
    border-top: 1px solid #f1f5f9 !important;
    margin-top: 0.5rem !important;
  }
  
  .status-cell {
    justify-content: center !important;
    font-size: 0.9rem !important;
  }
}

@media (max-width: 768px) {
  .desktop-only:not(.team-name) {
    display: none !important;
  }
}
</style>