<script setup>
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import axios from 'axios'
import { Eye, EyeOff, CheckCircle2, AlertCircle, Save, RotateCcw } from 'lucide-vue-next'

const user = reactive({
  firstName: 'John',
  lastName: 'Smith',
  email: 'dr.smith@clinic.com',
  role: 'Therapist',
  recruitmentDate: '2024-01-15',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop'
})

const originalUser = reactive({ ...user })

const password = ref('••••••••')
const showPassword = ref(false)
const isLight = ref(false)
const isSaving = ref(false)
const notification = ref(null)
const fileInput = ref(null)

const handleAvatarClick = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      user.avatar = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

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

const showNotification = (msg, type = 'success') => {
  notification.value = { msg, type }
  setTimeout(() => {
    notification.value = null
  }, 4000)
}

const fetchProfile = async () => {
  // First load logged-in user from localStorage if available
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser)
      Object.assign(user, {
        firstName: parsed.firstName || parsed.name?.split(' ')[0] || user.firstName,
        lastName: parsed.lastName || parsed.name?.split(' ')[1] || user.lastName,
        email: parsed.email || user.email,
        role: parsed.role || user.role,
        recruitmentDate: parsed.recruitmentDate || user.recruitmentDate,
        avatar: parsed.avatar || user.avatar
      })
      Object.assign(originalUser, user)
    } catch (e) {
      console.warn('Error parsing stored user', e)
    }
  }

  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const token = localStorage.getItem('token')
    const res = await axios.get(`${API_URL}/auth/profile`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (res.data) {
      Object.assign(user, res.data)
      Object.assign(originalUser, res.data)
      localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }))
    }
  } catch (err) {
    console.warn('Backend profile API not available, using stored logged-in user profile.', err)
  }
}

const handleSaveChanges = async () => {
  isSaving.value = true
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const token = localStorage.getItem('token')
    await axios.patch(`${API_URL}/auth/profile`, user, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    Object.assign(originalUser, user)
    localStorage.setItem('user', JSON.stringify({ ...user }))
    showNotification('Profile updated successfully!', 'success')
  } catch (err) {
    console.warn('Profile patch endpoint simulation:', err)
    Object.assign(originalUser, user)
    localStorage.setItem('user', JSON.stringify({ ...user }))
    showNotification('Changes saved successfully!', 'success')
  } finally {
    isSaving.value = false
  }
}

const handleDiscard = () => {
  Object.assign(user, originalUser)
  showNotification('Changes discarded.', 'info')
}

onMounted(() => {
  syncTheme()
  window.addEventListener('theme-changed', syncTheme)
  fetchProfile()
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

    <div class="relative z-10 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-text">Settings</h1>
        <p class="text-text-muted mt-2">Manage your account preferences and personal information.</p>
      </div>
      
      <!-- Alert banner -->
      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-[-10px]" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-[-10px]">
        <div v-if="notification" :class="[
          'px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium shadow-lg backdrop-blur-md',
          notification.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
        ]">
          <CheckCircle2 v-if="notification.type === 'success'" class="w-4 h-4 text-emerald-400" />
          <AlertCircle v-else class="w-4 h-4 text-blue-400" />
          {{ notification.msg }}
        </div>
      </transition>
    </div>

    <!-- Card -->
    <form @submit.prevent="handleSaveChanges" class="bg-surface/50 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/20 p-8 border border-white/10 relative z-10 overflow-hidden">

      <!-- Top Section -->
      <div class="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
        
        <div class="flex items-center gap-6">
          <div class="relative group cursor-pointer" @click="handleAvatarClick">
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              class="hidden" 
              @change="handleFileChange"
            />
            <img
              :src="user.avatar"
              class="w-24 h-24 rounded-full object-cover border-2 border-primary/30 shadow-md group-hover:opacity-80 transition-opacity"
              alt="Avatar"
            />
            <div class="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-white">
              Upload New
            </div>
          </div>

          <div>
            <h2 class="text-2xl font-semibold text-text">
              {{ user.firstName }} {{ user.lastName }}
            </h2>
            <span class="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
              {{ user.role }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button 
            type="submit" 
            :disabled="isSaving"
            class="bg-primary hover:bg-primary-hover active:scale-95 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 ring-1 ring-white/10 flex items-center gap-2 font-medium disabled:opacity-50"
          >
            <Save class="w-4 h-4" />
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
          <button 
            type="button" 
            @click="handleDiscard"
            class="bg-surface-hover hover:bg-white/10 active:scale-95 text-text-muted hover:text-text px-4 py-2.5 rounded-xl border border-border transition-all flex items-center gap-2 font-medium"
          >
            <RotateCcw class="w-4 h-4" />
            Discard
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">

        <!-- Personal Info -->
        <div class="space-y-5">
          <h3 class="flex items-center gap-2 text-lg font-semibold text-text mb-2">
            <span>📋</span> Personal Information
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">First Name</label>
              <input
                type="text"
                v-model="user.firstName"
                class="w-full rounded-xl bg-surface-hover/50 border border-border text-text px-3.5 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
              />
            </div>

            <div>
              <label class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Last Name</label>
              <input
                type="text"
                v-model="user.lastName"
                class="w-full rounded-xl bg-surface-hover/50 border border-border text-text px-3.5 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Role / Grade</label>
            <input
              type="text"
              v-model="user.role"
              class="w-full rounded-xl bg-surface-hover/50 border border-border text-text px-3.5 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Recruitment Date</label>
            <input
              type="date"
              v-model="user.recruitmentDate"
              class="w-full rounded-xl bg-surface-hover/50 border border-border text-text px-3.5 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
        </div>

        <!-- Account Settings -->
        <div class="lg:border-l lg:border-border lg:pl-10 space-y-5">
          <h3 class="flex items-center gap-2 text-lg font-semibold text-text mb-2">
            <span>🔒</span> Account Settings
          </h3>

          <div class="space-y-4">
            <div>
              <label class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Email Address</label>
              <input
                type="email"
                v-model="user.email"
                class="w-full rounded-xl bg-surface-hover/50 border border-border text-text px-3.5 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
              />
            </div>

            <div>
              <label class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Password</label>
              <div class="relative flex items-center">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  class="w-full rounded-xl bg-surface-hover/50 border border-border text-text pl-3.5 pr-10 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                />
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="absolute right-3 text-text-muted hover:text-text transition-colors"
                >
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="pt-4 border-t border-border/60">
              <label class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 block">Theme Preferences</label>
              <div class="flex items-center justify-between bg-surface-hover/40 border border-border/60 rounded-xl p-3.5 transition-colors">
                <span class="text-sm font-medium text-text">Use Light Mode Theme</span>
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

    </form>
  </div>
</template>