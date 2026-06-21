<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Sun, Moon, User, Clock, Calendar } from 'lucide-vue-next'
import { useAppointmentsShared } from '../composables/useAppointments'

const router = useRouter()
const { pendingAppointments, pendingCount, fetchAppointments } = useAppointmentsShared()

const isLight = ref(false)
const showNotifications = ref(false)

const syncTheme = () => {
  isLight.value = document.documentElement.classList.contains('light')
}

const toggleTheme = () => {
  if (document.documentElement.classList.contains('light')) {
    document.documentElement.classList.remove('light')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.add('light')
    localStorage.setItem('theme', 'light')
  }
  isLight.value = !isLight.value
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: isLight.value ? 'light' : 'dark' }))
}

const toggleNotifications = (e) => {
  e.stopPropagation()
  showNotifications.value = !showNotifications.value
}

const closeNotifications = () => {
  showNotifications.value = false
}

const clickOutside = (e) => {
  const bellContainer = document.getElementById('bell-container')
  if (bellContainer && !bellContainer.contains(e.target)) {
    closeNotifications()
  }
}

const navigateToAppointments = () => {
  router.push('/appointments')
  closeNotifications()
}

function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  syncTheme()
  window.addEventListener('theme-changed', syncTheme)
  window.addEventListener('click', clickOutside)
  fetchAppointments()
})

onUnmounted(() => {
  window.removeEventListener('theme-changed', syncTheme)
  window.removeEventListener('click', clickOutside)
})
</script>

<template>
  <header class="h-20 bg-surface/50 backdrop-blur-xl border-b border-border px-8 flex items-center justify-between z-40 relative">
    <div>
      <h2 class="text-lg font-bold text-text hidden sm:block">CalmBridge Portal</h2>
    </div>

    <div class="flex items-center gap-6">
      <!-- Theme Toggle -->
      <button
        @click="toggleTheme"
        class="p-2.5 rounded-xl text-text-muted hover:bg-surface-hover hover:text-text transition-all duration-200 cursor-pointer"
        title="Toggle Theme"
      >
        <Sun v-if="isLight" class="w-5 h-5 transition-transform duration-200 hover:rotate-45" />
        <Moon v-else class="w-5 h-5 transition-transform duration-200 hover:-rotate-12" />
      </button>

      <!-- Notifications Bell -->
      <div id="bell-container" class="relative">
        <button
          @click="toggleNotifications"
          class="p-2.5 rounded-xl text-text-muted hover:bg-surface-hover hover:text-text transition-all duration-200 relative cursor-pointer"
          title="Notifications"
        >
          <Bell class="w-5 h-5" />
          <span 
            v-if="pendingCount > 0"
            class="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse"
          >
            {{ pendingCount }}
          </span>
        </button>

        <!-- Notification Dropdown -->
        <div 
          v-if="showNotifications"
          class="absolute right-0 mt-3 w-80 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div class="p-4 border-b border-border flex items-center justify-between bg-surface-hover/20">
            <h3 class="font-bold text-text text-sm flex items-center gap-2">
              <Bell class="w-4 h-4 text-primary" />
              Notifications
            </h3>
            <span v-if="pendingCount > 0" class="text-xs text-yellow-500 font-semibold bg-yellow-500/10 px-2 py-0.5 rounded-full">
              {{ pendingCount }} new request{{ pendingCount > 1 ? 's' : '' }}
            </span>
          </div>

          <div class="max-h-72 overflow-y-auto divide-y divide-border">
            <div v-if="pendingCount === 0" class="p-8 text-center text-text-muted text-sm">
              <Bell class="w-8 h-8 mx-auto opacity-30 mb-2" />
              No new requests pending.
            </div>
            
            <div 
              v-else
              v-for="req in pendingAppointments"
              :key="req.id"
              @click="navigateToAppointments"
              class="p-4 hover:bg-surface-hover/50 transition-all cursor-pointer flex items-start gap-3"
            >
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <User class="w-4 h-4" />
              </div>
              <div class="space-y-1">
                <p class="text-xs text-text font-semibold">
                  New request from {{ req.student?.firstName }} {{ req.student?.lastName }}
                </p>
                <p class="text-[11px] text-primary font-medium">{{ req.type }}</p>
                <p class="text-[10px] text-text-muted flex items-center gap-1">
                  <Clock class="w-3 h-3" />
                  Requested {{ formatDate(req.createdAt) }}
                </p>
              </div>
            </div>
          </div>

          <div class="p-3 bg-surface-hover/20 text-center border-t border-border">
            <button 
              @click="navigateToAppointments"
              class="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1.5 justify-center mx-auto cursor-pointer"
            >
              View all requests
              <Calendar class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Profile avatar mock -->
      <div class="flex items-center gap-3 border-l border-border pl-6">
        <div class="w-9 h-9 rounded-xl overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
          DS
        </div>
        <div class="hidden md:block">
          <p class="text-xs font-bold text-text leading-tight">Dr. Smith</p>
          <p class="text-[10px] text-text-muted">Therapist</p>
        </div>
      </div>
    </div>
  </header>
</template>
