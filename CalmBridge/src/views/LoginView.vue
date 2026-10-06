<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Activity, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { getFriendlyErrorMessage } from '../utils/errorHandler'

const router = useRouter()
const showPassword = ref(false)
// info to log in 
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')


const handleLogin = async () => {

  try {

    loading.value = true
    error.value = ''

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(
      `${API_URL}/auth/login`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.message || 'Login failed',
      )
    }

   if (data.user.role !== 'THERAPIST') {
  throw new Error('This platform is only accessible to therapists')
  }

  localStorage.setItem(
  'token',
  data.accessToken,
  )

  localStorage.setItem(
  'user',
  JSON.stringify(data.user),
  )

  router.push('/')

  } catch (err) {

    error.value = getFriendlyErrorMessage(err)

  } finally {

    loading.value = false
  }
}
</script>

<template>
  <div class=" p-8 min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none"></div>

    <div class="w-full max-w-md p-8 bg-surface/80  rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
      <div class="flex flex-col items-center mb-8">
        <div class="w-22 h-22  overflow-hidden mb-4 items-center justify-center p-2 ">
          <img src='/logo.png' class="w-full h-full object-contain" />
        </div>
        <h1 class="text-3xl font-bold text-text drop-shadow-sm font-sans tracking-tight">CalmBridge</h1>
        <p class="text-text-muted mt-2 text-center">Sign in to your therapist dashboard to manage patients and VR sessions.</p>
      </div>

      <div class="space-y-4">
        
        <div class="relative flex items-center py-2">
          <div class="flex-grow border-t border-border"></div>
          <div class="flex-grow border-t border-border"></div>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1.5">Email Address</label>
            <input 
              v-model="email" 
              placeholder="dr.smith@clinic.com"
              class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1.5">Password</label>
            <div class="relative">
              <input 
                v-model="password"
                :type="showPassword ? 'text' : 'password'" 
                placeholder="••••••••"
                class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-12"
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword" 
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-white transition-colors focus:outline-none"
              >
                <Eye v-if="showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>
          <p v-if="error" class="text-red-400 text-sm text-center font-medium bg-red-500/10 py-2 rounded-xl">
            {{ error }}
          </p>
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <template v-if="loading">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing in...</span>
            </template>
            <span v-else>Sign In</span>
          </button>
        </form>
      </div>

      <p class="text-center text-text-muted text-sm mt-8">
        Don't have an account? <a href="#" class="text-primary hover:text-primary-hover font-medium transition-colors">Contact Administrator</a>
      </p>
    </div>
  </div>
</template>
