<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Activity, Eye, EyeOff } from 'lucide-vue-next'

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

    const response = await fetch(
      'http://localhost:3000/auth/login',
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

    error.value = err.message

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

    <div class="w-full max-w-md p-8 bg-surface/80 backdrop-blur-xl border border-border rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
      <div class="flex flex-col items-center mb-8">
        <div class="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-primary/30 mb-4">
          <img src='/logo.png' class="w-full h-full object-cover" />
        </div>
        <h1 class="text-3xl font-bold text-white drop-shadow-sm">CalmBridge</h1>
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
              <p v-if="error"
                class="text-red-400 text-sm text-center"
              >
                {{ error }}
              </p>
            </div>
          </div>
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10"
          >
            Sign In
          </button>
        </form>
      </div>

      <p class="text-center text-text-muted text-sm mt-8">
        Don't have an account? <a href="#" class="text-primary hover:text-primary-hover font-medium transition-colors">Contact Administrator</a>
      </p>
    </div>
  </div>
</template>
