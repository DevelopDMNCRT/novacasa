<script setup>
import { ref, onMounted } from 'vue'
import { Trophy, Save, CheckCircle } from 'lucide-vue-next'
import { API_BASE_URL } from '../config'

const matches = ref([])
const isLoading = ref(true)

const fetchMatches = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/matches`)
    if (res.ok) {
      matches.value = await res.json()
    }
  } catch (err) {
    console.error('Error fetching matches:', err)
  } finally {
    isLoading.value = false
  }
}

const saveResult = async (match) => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`${API_BASE_URL}/api/matches/${match.id}/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        home_score_real: match.home_score_real,
        away_score_real: match.away_score_real
      })
    })

    if (res.ok) {
      alert(`Resultado de ${match.home_team} vs ${match.away_team} guardado.`)
    } else {
      const data = await res.json()
      alert('Error: ' + data.error)
    }
  } catch (err) {
    console.error('Error saving result:', err)
    alert('Error de conexión al guardar el resultado.')
  }
}

onMounted(fetchMatches)
</script>

<template>
  <div class="admin-results animate-fade-in">
    <div class="view-header">
      <h1 class="view-title">Panel de Administración</h1>
      <p class="view-subtitle">Ingresa los resultados oficiales de los partidos para actualizar el tablero de puntos.</p>
    </div>

    <div v-if="isLoading" class="loading">Cargando partidos...</div>
    
    <div v-else class="results-grid">
      <div v-for="match in matches" :key="match.id" class="match-admin-card glass-card">
        <div class="match-header">
          <span class="jornada-badge">Jornada {{ match.jornada }}</span>
          <span class="match-date">{{ match.date_text }}</span>
        </div>

        <div class="teams-input-section">
          <div class="team-input-row">
            <div class="team-info">
              <img :src="`https://flagcdn.com/w40/${match.home_logo}.png`" class="flag">
              <span class="team-name">{{ match.home_team }}</span>
            </div>
            <input 
              type="number" 
              v-model="match.home_score_real" 
              placeholder="--" 
              class="admin-score-input"
            >
          </div>

          <div class="team-input-row">
            <div class="team-info">
              <img :src="`https://flagcdn.com/w40/${match.away_logo}.png`" class="flag">
              <span class="team-name">{{ match.away_team }}</span>
            </div>
            <input 
              type="number" 
              v-model="match.away_score_real" 
              placeholder="--" 
              class="admin-score-input"
            >
          </div>
        </div>

        <button @click="saveResult(match)" class="btn-save-result">
          <Save :size="18" />
          GUARDAR RESULTADO
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
}

.view-header {
  margin-bottom: 3rem;
}

.view-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
}

.view-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.match-admin-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: white;
  border-top: 4px solid var(--primary-color);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.jornada-badge {
  background: var(--bg-secondary);
  padding: 0.3rem 0.7rem;
  font-weight: 700;
  font-size: 0.8rem;
  border-radius: 4px;
}

.match-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.teams-input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.team-input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.flag {
  width: 28px;
  height: 20px;
  object-fit: contain;
}

.team-name {
  font-weight: 700;
  color: var(--text-primary);
}

.admin-score-input {
  width: 60px;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 800;
  border: 1px solid var(--border-color);
  background: #f8fafc;
}

.admin-score-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: white;
}

.btn-save-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  padding: 1rem;
  background: var(--text-primary);
  color: white;
  border: none;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save-result:hover {
  background: var(--primary-color);
  transform: translateY(-2px);
}

.loading {
  text-align: center;
  padding: 5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-secondary);
}
</style>
