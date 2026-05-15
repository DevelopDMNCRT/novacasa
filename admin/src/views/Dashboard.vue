<script setup>
import { Users, UserCheck, LayoutDashboard } from 'lucide-vue-next'
</script>

<template>
  <div class="admin-dashboard">
    <header class="page-header">
      <h1 class="page-title">Panel de Administración</h1>
      <p class="page-subtitle">Gestiona usuarios y participantes de la Quiniela Nova Casa 2026.</p>
    </header>

    <div class="stats-grid">
      <router-link to="/usuarios" class="stat-card glass-card">
        <div class="stat-icon-wrap">
          <Users :size="32" class="stat-icon" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Usuarios Totales</span>
          <span class="stat-value">1,240</span>
        </div>
      </router-link>

      <router-link to="/participantes" class="stat-card glass-card">
        <div class="stat-icon-wrap">
          <UserCheck :size="32" class="stat-icon icon-green" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Participantes Activos</span>
          <span class="stat-value">856</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: 2rem 0;
}

.page-header {
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6b6375;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2.5rem;
  background: white;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e5e7eb;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  border-color: #006847;
}

.stat-icon-wrap {
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  color: #006847;
}

.icon-green {
  color: #006847;
}

.stat-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b6375;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
}
</style>
