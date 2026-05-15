<script setup>
import { ref, computed, onMounted } from 'vue'
import { Medal, Award, TrendingUp, Trophy } from 'lucide-vue-next'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const leaderboard = ref([])

const currentPage = ref(1)
const itemsPerPage = 20

const paginatedLeaderboard = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return leaderboard.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(leaderboard.value.length / itemsPerPage))

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const goToPage = (page) => {
  currentPage.value = page
}

const fetchLeaderboard = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/leaderboard`)
    if (res.ok) {
      leaderboard.value = await res.json()
    }
  } catch (err) {
    console.error('Error fetching leaderboard:', err)
  }
}

onMounted(() => {
  fetchLeaderboard()
})

const getMedalColor = (rank) => {
  if (rank === 1) return '#F59E0B' // Gold
  if (rank === 2) return '#94A3B8' // Silver
  if (rank === 3) return '#B45309' // Bronze
  return ''
}
</script>

<template>
  <div class="leaderboard-view animate-fade-in">
    <div class="view-header">
      <div class="header-main">
        <h1 class="view-title">Tabla General</h1>
        <p class="view-subtitle">Top 100 Clasificación - Los mejores pronósticos del torneo.</p>
      </div>
      
      <div class="rules-card glass-card">
        <div class="rules-info">
          <span class="rule"><Award :size="16" /> <b>2 pts:</b> Marcador exacto.</span>
          <span class="rule"><TrendingUp :size="16" /> <b>1 pt:</b> Atinar ganador/empate.</span>
          <span class="rule"><Trophy :size="16" /> <b>3 pts:</b> Selección campeona.</span>
        </div>
      </div>
    </div>

    <!-- Leaderboard Table -->
    <div class="table-container glass-card">
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th class="rank-col">POS</th>
            <th>USUARIO</th>
            <th class="points-col">PUNTOS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedLeaderboard" :key="user.id" class="table-row" :class="{'top-tier': user.rank <= 3}">
            <td class="rank-col">
              <div class="rank-badge" :class="`rank-${user.rank}`">
                <Medal v-if="user.rank <= 3" :size="20" :color="getMedalColor(user.rank)" class="medal-icon" />
                <span v-else>{{ user.rank }}</span>
              </div>
            </td>
            <td>
              <div class="user-info">
                <div class="avatar" :class="{'avatar-gold': user.rank === 1, 'avatar-silver': user.rank === 2, 'avatar-bronze': user.rank === 3}">
                  {{ user.name.charAt(0) }}
                </div>
                <div class="user-details">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-handle">{{ user.username }}</span>
                </div>
              </div>
            </td>
            <td class="points-col">
              <span class="points-value">{{ user.points }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          Anterior
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="goToPage(page)"
            class="page-num-btn"
            :class="{ active: currentPage === page }"
          >
            {{ page }}
          </button>
        </div>

        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          Siguiente
        </button>
      </div>
    </div>

    <div class="sponsor-footer-strip">
      <img src="/Tira logos.png?v=2" alt="Patrocinadores Oficiales" class="sponsor-footer-logo" />
    </div>
  </div>
</template>

<style scoped>
.leaderboard-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
  min-height: 100vh;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
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

.rules-card {
  padding: 1rem 1.5rem;
  background: white;
  border-left: 4px solid var(--primary-color);
}

.rules-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rule {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.text-faded {
  color: #94a3b8;
  font-size: 0.75rem;
}

/* Table Styles */
.table-container {
  padding: 1rem;
  background: white;
}

.leaderboard-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.leaderboard-table th {
  padding: 1.5rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border-bottom: 1px solid var(--border-color);
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row.top-tier {
  background: linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent);
}
.table-row.top-tier:hover {
  background: linear-gradient(to right, rgba(245, 158, 11, 0.08), transparent);
}

.table-row td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid var(--border-color);
}

.table-row:last-child td {
  border-bottom: none;
}

.rank-col {
  width: 80px;
  text-align: center;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-weight: 800;
  font-size: 1rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
}

.rank-1, .rank-2, .rank-3 {
  background: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.points-col {
  text-align: right;
  width: 120px;
  padding-right: 2rem !important;
}

.points-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  font-family: 'Outfit', sans-serif;
}

.top-tier .points-value {
  color: var(--primary-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--text-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
}

.avatar-gold { background: linear-gradient(135deg, #F59E0B, #B45309); }
.avatar-silver { background: linear-gradient(135deg, #CBD5E1, #64748B); }
.avatar-bronze { background: linear-gradient(135deg, #D97706, #78350F); }

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
}

.user-handle {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1rem 0.5rem;
  border-top: 1px solid var(--border-color);
}

.page-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  justify-content: center;
}

.page-num-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-num-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.page-num-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .leaderboard-view { padding: 6rem 1rem 3rem; }
  .view-header { flex-direction: column; align-items: stretch; gap: 1.5rem; }
  .view-title { font-size: 2.25rem; }
  .table-container { padding: 0.5rem; }
  .points-col { width: 80px; padding-right: 1rem !important; }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
  .page-numbers {
    order: -1;
  }
  .page-btn {
    width: 100%;
  }
}
</style>
