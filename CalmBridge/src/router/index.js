import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import PatientsView from '../views/PatientsView.vue'
import ConsultationsListView from '../views/ConsultationsListView.vue'
import ActiveSessionView from '../views/ActiveSessionView.vue'
import ConsultationDetailsView from '../views/ConsultationDetailsView.vue'
import Settings from '../views/Settings.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/patients',
      name: 'patients',
      component: PatientsView
    },
    {
      path: '/consultations',
      name: 'consultations',
      component: ConsultationsListView
    },
    {
      path: '/session/:id',
      name: 'session',
      component: ActiveSessionView
    },
    {
      path: '/consultation/:id',
      name: 'consultationDetails',
      component: ConsultationDetailsView
    }
    , {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
})

// Simple mock authentication guard
router.beforeEach((to, from, next) => {
  // In a real app, this would check Vuex/Pinia or localStorage
  const isAuthenticated = false // Hardcoded for demo purposes: will show login first
  const hasVisited = localStorage.getItem('hasVisitedLogin')

  if (to.name !== 'login' && !hasVisited) {
    localStorage.setItem('hasVisitedLogin', 'true')
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
