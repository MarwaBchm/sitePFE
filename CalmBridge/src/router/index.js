import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import PatientsView from '../views/PatientsView.vue'
import AppointmentsView from '../views/AppointmentsView.vue'
import MonitoringDashboard from '../views/MonitoringDashboard.vue'
import ActiveSessionView from '../views/ActiveSessionView.vue'
import ConsultationDetailsView from '../views/ConsultationDetailsView.vue'
import Settings from '../views/Settings.vue';
import liveMonitoring from '../views/liveMonitoring.vue'; 
import PatientRecordsView from '../views/PatientRecordsView.vue'

import { isAuthenticated } from '../utils/auth'

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
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/patients',
      name: 'patients',
      component: PatientsView
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: AppointmentsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/MonitoringDashboard',
      name: 'Monitoring Dashboard',
      component: MonitoringDashboard
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
    },  {
      path: '/records/:id',
      name: 'patientRecords',
      component: PatientRecordsView
    }
  ]
})

// Simple mock authentication guard
router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  if (!token && to.meta.requiresAuth) {
    return { name: 'login' }
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (
    to.meta.requiresAuth &&
    user.role !== 'THERAPIST'
  ) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    return { name: 'login' }
  }

  if (to.name === 'login' && token) {
    return { name: 'dashboard' }
  }

  return true
})
export default router
