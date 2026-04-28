<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { LayoutDashboard, Users, Activity, Settings, LogOut } from 'lucide-vue-next'

const route = useRoute()

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patients', path: '/patients', icon: Users },
  { name: 'Consultations', path: '/consultations', icon: Activity },
  // Optional mock links for better UI look
  { name: 'Settings', path: '/settings', icon: Settings },
]

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="w-64 bg-surface border-r border-border flex flex-col transition-all duration-300">
    <div class="h-20 flex items-center px-8 border-b border-border">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg overflow-hidden shadow-blue-700 shadow-primary/25">
          <img src="/loggo.png" alt="Logo" class="w-full h-full object-cover" />
        </div>
        <h1 class="text-xl font-semibold bg-gradient-to-r from-white via-blue-200 to-primary bg-clip-text text-transparent drop-shadow-sm">
          CalmBridge
        </h1>
      </div>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-2">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
        :class="[
          isActive(item.path)
            ? 'bg-gradient-to-r from-blue-900 via-blue-600  to-blue-700 text-white font-medium '
            : 'text-text-muted hover:bg-surface-hover hover:text-white'
        ]"
      > 
        <component
          :is="item.icon"
          class="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
          :class="isActive(item.path) ? 'text-white' : 'text-text-muted group-hover:text-white'"
        />
        {{ item.name }}
      </router-link>
    </nav>

    <div class="p-4 border-t border-border">
      <button class="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group">
        <LogOut class="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>
