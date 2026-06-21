<script setup>

import { onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios'

const user = ref({
  firstName: 'John',
  lastName: 'Smith',
  email: 'dr.smith@clinic.com',
  role: 'Therapist',
  recruitmentDate: '2024-01-15',
})
const isLight = ref(false)

const syncTheme = () => {
  isLight.value = document.documentElement.classList.contains('light')
}

const toggleThemeSetting = () => {
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

onMounted(async () => {
  syncTheme()
  window.addEventListener('theme-changed', syncTheme)

  try {
    const res = await axios.get(
      'http://localhost:3000/auth/profile'
    )
    if (res.data) {
      user.value = res.data
    }
  } catch (err) {
    console.warn('Backend profile API not available, using mock user profile.', err)
  }
})

onUnmounted(() => {
  window.removeEventListener('theme-changed', syncTheme)
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
    <!-- Decorative background elements -->
    <div class="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none z-0"></div>

    <div class="relative z-10">
      <h1 class="text-3xl font-bold tracking-tight text-text">Settings</h1>
      <p class="text-text-muted mt-2">Manage your account preferences and personal information.</p>
    </div>

    <!-- Card -->
    <div class="bg-surface/50 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/20 p-8 border border-white/10 relative z-10 overflow-hidden">

      <!-- Top Section -->
      <div class="flex items-center justify-between mb-8">
        
        <div class="flex items-center gap-6">
          <img
            src="https://i.imgur.com/1X6QZ6H.png"
            class="w-24 h-24 rounded-full object-cover"
          />

          <div>
            <h2 class="text-xl font-semibold text-text">
              {{ user.firstName }} {{ user.lastName }}
            </h2>
            <p class="text-text-muted">{{ user.role }}</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10">
            Save Changes
          </button>
          <button class="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors">
            Discard
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="grid grid-cols-2 gap-10">

        <!-- Personal Info -->
        <div>
          <h3 class="flex items-center gap-2 font-semibold text-text mb-4">
            📋 Personal Information
          </h3>

          <div class="space-y-3 text-text-muted">
            <p><strong class="text-text">First Name:</strong> {{ user.firstName }}</p>
            <p><strong class="text-text">Last Name:</strong> {{ user.lastName }}</p>
            <p><strong class="text-text">Recruitment Date:</strong> {{ user.recruitmentDate }}</p>
            <p><strong class="text-text">Grade:</strong> {{ user.role }}</p>
          </div>
        </div>

        <!-- Account Settings -->
        <div class="border-l border-border pl-8">
          <h3 class="flex items-center gap-2 font-semibold text-text mb-4">
            🔒 Account Settings
          </h3>

          <div class="space-y-6">
            
            <div>
              <label class="text-sm text-text-muted">Email</label>
              <input
                type="text"
                v-model="user.email"
                class="w-full border-b border-border bg-transparent text-text outline-none py-1 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label class="text-sm text-text-muted">Password</label>
              <div class="flex items-center gap-2">
                <input
                  type="password"
                  value="********"
                  class="w-full border-b border-border bg-transparent text-text outline-none py-1 focus:border-primary transition-colors"
                />
                <span class="cursor-pointer">👁️</span>
              </div>
            </div>

            <div class="pt-4 border-t border-border">
              <label class="text-sm text-text-muted mb-2 block font-medium">Theme Preferences</label>
              <div class="flex items-center justify-between bg-surface-hover/30 border border-border rounded-xl p-3 transition-colors">
                <span class="text-sm text-text">Use Light Mode Theme</span>
                <button 
                  type="button" 
                  @click="toggleThemeSetting"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="isLight ? 'bg-primary' : 'bg-border'"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="isLight ? 'translate-x-5' : 'translate-x-0'"
                  ></span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  </div>
</template>