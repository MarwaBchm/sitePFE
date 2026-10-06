<script setup>
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  LogOut,
  Calendar,
} from 'lucide-vue-next'
import { useAppointmentsShared } from '../composables/useAppointments'
import { useLayout } from '../composables/useLayout'

const route = useRoute()
const router = useRouter()

const { pendingCount } = useAppointmentsShared()
const { isSidebarOpen, closeSidebar } = useLayout()

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patients', path: '/patients', icon: Users },
  { name: 'Appointments', path: '/appointments', icon: Calendar },
  { name: 'Monitoring Dashboard', path: '/MonitoringDashboard', icon: Activity },
  { name: 'Settings', path: '/settings', icon: Settings },
]

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const logout = () => {
  // Clear all authentication keys from storage
  localStorage.removeItem('accessToken')
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  closeSidebar()

  // Navigate back to login view
  router.push('/login').then(() => {
    window.location.href = '/login'
  }).catch(() => {
    window.location.href = '/login'
  })
}
</script>

<template>
  <!-- Mobile Overlay -->
  <div v-if="isSidebarOpen" @click="closeSidebar" class="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity cursor-pointer"></div>

  <aside
    class="w-64 md:w-56 lg:w-64 bg-surface border-r border-border flex flex-col transition-all duration-300 z-50 fixed md:relative h-full"
    :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <!-- Logo -->
    <div
      class="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-border bg-surface/50 backdrop-blur-md"
    >
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-xl overflow-hidden  shadow-primary/20 bg-surface flex items-center justify-center p-1.5 ">
          <img src="/loggo.png" alt="Logo" class="w-full h-full object-contain" />
        </div>

        <h1 class="hidden md:block text-2xl font-bold text-text tracking-tight font-sans">
          CalmBridge
        </h1>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 md:px-4 py-6 space-y-2">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.path"
        @click="closeSidebar"
        class="flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3 rounded-xl transition-all duration-200 group"
        :class="[
          isActive(item.path)
            ? 'bg-primary text-white font-medium'
            : 'text-text-muted hover:bg-surface-hover hover:text-text',
        ]"
      >
        <component
          :is="item.icon"
          class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          :class="
            isActive(item.path)
              ? 'text-white'
              : 'text-text-muted group-hover:text-white'
          "
        />

        <span class="md:inline flex-grow text-left">
          {{ item.name }}
        </span>

        <span
          v-if="item.name === 'Appointments' && pendingCount > 0"
          class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shrink-0"
        />
      </router-link>
    </nav>

    <!-- Logout -->
    <div class="p-2 md:p-4 border-t border-border">
      <button
        @click="logout"
        class="flex items-center justify-start gap-3 px-3 md:px-4 py-3 w-full rounded-xl text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
      >
        <LogOut
          class="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200"
        />
        <span class="md:inline">Logout</span>
      </button>
    </div>
  </aside>
</template>