<script setup>
import AdminNavbar from './components/AdminNavbar.vue'
</script>

<template>
  <div class="admin-app">
    <AdminNavbar />
    <main class="admin-main">
      <div class="container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style>
:root {
  --primary-color: #006847;
  --secondary-color: #CE1126;
  --bg-color: #f8fafc;
  --text-primary: #1a1a2e;
  --text-secondary: #6b6375;
  --border-color: #e5e7eb;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
  line-height: 1.5;
}

.admin-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-main {
  flex: 1;
  padding: 2rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.glass-card {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
