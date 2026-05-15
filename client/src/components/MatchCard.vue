<script setup>
import { defineProps } from 'vue'
import { Calendar } from 'lucide-vue-next'

const props = defineProps({
  match: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="match-card glass-card animate-fade-in">
    <div class="match-info">
      <div class="info-item">
        <Calendar :size="14" />
        <span>{{ match.date }} • {{ match.time }}</span>
      </div>
      <div class="match-id">#{{ match.id }}</div>
    </div>

    <div class="teams-stack">
      <div class="team-row">
        <div class="team-brand">
          <div class="team-logo">
            <img :src="match.homeLogo" :alt="match.home">
          </div>
          <span class="team-name">{{ match.home }}</span>
        </div>
        <input type="number" v-model="match.homeScore" placeholder="--" class="score-input" :disabled="match.saved">
      </div>

      <div class="team-row">
        <div class="team-brand">
          <div class="team-logo">
            <img :src="match.awayLogo" :alt="match.away">
          </div>
          <span class="team-name">{{ match.away }}</span>
        </div>
        <input type="number" v-model="match.awayScore" placeholder="--" class="score-input" :disabled="match.saved">
      </div>
    </div>
  </div>
</template>

<style scoped>
.match-card {
  padding: 1.25rem;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  background: white;
  position: relative;
}

.match-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
}

.match-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.teams-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.team-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.team-row:hover {
  background: white;
  border-color: var(--border-color);
}

.team-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.team-logo {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.team-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
}

.score-input {
  width: 45px;
  height: 45px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 0;
  text-align: center;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 800;
  transition: all 0.2s ease;
}

.score-input:focus {
  border-color: var(--primary-color);
  background: white;
  box-shadow: 0 0 0 3px var(--primary-glow);
  outline: none;
}

.score-input:disabled {
  background-color: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
  opacity: 0.8;
}

/* Remove arrows from number input */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

@media (max-width: 600px) {
  .team-name {
    font-size: 0.9rem;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
