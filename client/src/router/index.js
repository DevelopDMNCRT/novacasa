import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/quiniela',
    name: 'Quiniela',
    component: () => import('../views/Quiniela.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mis-pronosticos',
    name: 'MyPredictions',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tabla-general',
    name: 'Leaderboard',
    component: () => import('../views/Leaderboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reglas',
    name: 'Rules',
    component: () => import('../views/Rules.vue')
  },
  {
    path: '/registro',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/recuperar-contrasena',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPassword.vue')
  },
  {
    path: '/restablecer-contrasena',
    name: 'ResetPassword',
    component: () => import('../views/ResetPassword.vue')
  },
  {
    path: '/perfil',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/resultados',
    name: 'AdminResults',
    component: () => import('../views/AdminResults.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/privacidad',
    name: 'Privacy',
    component: () => import('../views/Privacy.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  let user = null
  try {
    const stored = localStorage.getItem('user')
    if (stored && stored !== 'undefined') {
      user = JSON.parse(stored)
    }
  } catch (err) {
    console.error('Error parsing user from localStorage:', err)
  }
  
  const isAdmin = user && user.is_admin

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
