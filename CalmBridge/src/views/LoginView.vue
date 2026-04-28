<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Activity, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const showPassword = ref(false)

const handleGoogleSignIn = () => {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  
  const popup = window.open(
    '', 
    'Google Sign In', 
    `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
  );

  if (popup) {
    popup.document.write(`
      <html>
        <head><title>Google Sign In</title></head>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #fff;">
          <div style="text-align: center;">
            <svg width="46" height="46" viewBox="0 0 46 46" style="margin-bottom: 20px;">
              <path d="M43.95 23.5c0-1.63-.14-3.19-.41-4.7H23.5v8.9h11.47c-.5 2.87-2.05 5.3-4.47 6.91v5.74h7.24c4.23-3.9 6.21-9.67 6.21-16.85z" fill="#4285F4"/>
              <path d="M23.5 44.3c5.75 0 10.57-1.9 14.1-5.16l-7.24-5.74c-1.9 1.28-4.34 2.03-6.86 2.03-5.27 0-9.74-3.56-11.34-8.34H4.66v5.93C8.28 40.16 15.34 44.3 23.5 44.3z" fill="#34A853"/>
              <path d="M12.16 27.09c-.41-1.22-.64-2.52-.64-3.84s.23-2.62.64-3.84V13.48H4.66C3.21 16.38 2.4 19.71 2.4 23.25s.81 6.87 2.26 9.77l7.5-5.93z" fill="#FBBC05"/>
              <path d="M23.5 11.23c3.13 0 5.94 1.07 8.15 3.19l6.11-6.11C34.05 4.96 29.23 2.7 23.5 2.7 15.34 2.7 8.28 6.84 4.66 14.05l7.5 5.93c1.6-4.78 6.07-8.34 11.34-8.34z" fill="#EA4335"/>
            </svg>
            <h2 style="color: #202124; font-weight: normal; margin: 0 0 10px 0;">Sign in with Google</h2>
            <p style="color: #5f6368; margin: 0;">Please wait while we authenticate...</p>
          </div>
        </body>
      </html>
    `);

    setTimeout(() => {
      popup.close();
      router.push('/');
    }, 1500);
  } else {
    router.push('/');
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
        <h1 class="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-primary bg-clip-text text-transparent drop-shadow-sm">CalmBridge</h1>
        <p class="text-text-muted mt-2 text-center">Sign in to your therapist dashboard to manage patients and VR sessions.</p>
      </div>

      <div class="space-y-4">
        <!-- Google Sign-in Button -->
        <button 
          @click="handleGoogleSignIn"
          class="w-full bg-white hover:bg-slate-300 text-gray-900 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
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
              class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1.5">Password</label>
            <div class="relative">
              <input 
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
          <button 
            type="submit"
            class="w-full bg-gradient-to-r from-primary to-primary-hover text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10"
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
