<script setup>
import { useRouter } from 'vue-router'
import { Activity } from 'lucide-vue-next'

const router = useRouter()

const handleGoogleSignIn = () => {
  // Mock authentication logic
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none"></div>

    <div class="w-full max-w-md p-8 bg-surface/80 backdrop-blur-xl border border-border rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
      <div class="flex flex-col items-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
          <Activity class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">CalmBridge</h1>
        <p class="text-text-muted mt-2 text-center">Sign in to your therapist dashboard to manage patients and VR sessions.</p>
      </div>

      <div class="space-y-4">
        <!-- Google Sign-in Button -->
        <button 
          @click="handleGoogleSignIn"
          class="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div class="relative flex items-center py-2">
          <div class="flex-grow border-t border-border"></div>
          <span class="flex-shrink-0 mx-4 text-text-muted text-sm">or</span>
          <div class="flex-grow border-t border-border"></div>
        </div>

        <form @submit.prevent="handleGoogleSignIn" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1.5">Email Address</label>
            <input 
              type="email" 
              placeholder="dr.smith@clinic.com"
              class="w-full bg-surface-hover/50 border border-border rounded-xl px-4 py-2.5 text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1.5">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              class="w-full bg-surface-hover/50 border border-border rounded-xl px-4 py-2.5 text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <button 
            type="submit"
            class="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
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
