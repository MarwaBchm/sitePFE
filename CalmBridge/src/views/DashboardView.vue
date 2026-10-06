<script setup>
import { ref, onMounted } from 'vue'
import { Users, Activity, Clock, TrendingUp, Loader2 } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { getMyPatients } from '../services/patientservice.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const user = JSON.parse(localStorage.getItem('user')) || { firstName: 'User', lastName: '' }
const isLoadingStats = ref(true)

const stats = ref([
  { name: 'Total Patients', value: '0', icon: Users, change: '+12%', changeType: 'positive' },
  { name: 'Active Sessions', value: '0', icon: Activity, change: '+5%', changeType: 'positive' },
  { name: 'Avg. Session Time', value: '24m', icon: Clock, change: '+2m', changeType: 'positive' },
  { name: 'Success Rate', value: '94%', icon: TrendingUp, change: '+3%', changeType: 'positive' },
])

const recentActivity = ref([])

onMounted(async () => {
  try {
    isLoadingStats.value = true
    const userId = user.userId || user.id
    if (userId) {
      const res = await getMyPatients(userId)
      const patientList = res.data || []
      stats.value[0].value = String(patientList.length)
      const totalSess = patientList.reduce((acc, p) => acc + (p.totalSessions || 0), 0)
      stats.value[1].value = String(totalSess)
    }
  } catch (err) {
    console.warn('Could not fetch dashboard stats', err)
  } finally {
    isLoadingStats.value = false
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
  },
  plugins: { legend: { display: false } }
}

const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [{
    label: 'Consultations',
    data: [65, 78, 90, 81, 112, 125, 140],
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 2,
    fill: true,
    tension: 0.4
  }]
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-text">Overview</h1>
      <p class="text-text-muted mt-2">Welcome back, {{ user.firstName }} {{ user.lastName }}. Here's what's happening today.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="(stat, index) in stats" 
        :key="stat.name"
        class="bg-surface/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 group animate-wave-glow"
        :style="{ animationDelay: `${index * 0.3}s` }"
      >
        <div class="flex items-center justify-between">
          <div 
            class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner animate-icon-glow"
            :style="{ animationDelay: `${index * 0.3}s` }"
          >
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <span 
            class="text-sm font-medium px-2 py-1 rounded-full"
            :class="stat.changeType === 'positive' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'"
          >
            {{ stat.change }}
          </span>
        </div>
        <div class="mt-6">
          <p class="text-text-muted text-sm font-medium">{{ stat.name }}</p>
          <div v-if="isLoadingStats" class="mt-2 flex items-center gap-2 text-primary">
            <Loader2 class="w-5 h-5 animate-spin" />
            <span class="text-xs text-text-muted">Loading...</span>
          </div>
          <p v-else class="text-3xl font-bold text-text mt-1">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart -->
      <div class="bg-surface rounded-2xl border border-border overflow-hidden lg:col-span-2 flex flex-col shadow-lg shadow-black/20 hover:border-primary/30 transition-colors duration-300">
        <div class="px-6 py-5 border-b border-border flex justify-between items-center">
          <h2 class="text-xl font-semibold text-text">Consultation Activity</h2>
        </div>
        <div class="p-6 flex-1 min-h-[300px]">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-surface rounded-2xl border border-border overflow-hidden shadow-lg shadow-black/20 hover:border-primary/30 transition-colors duration-300">
        <div class="px-6 py-5 border-b border-border">
          <h2 class="text-xl font-semibold text-text">Recent Activity</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-if="recentActivity.length === 0" class="p-6 text-center text-text-muted text-sm">
            No recent activity to display.
          </div>
          <div 
            v-for="activity in recentActivity" 
            :key="activity.id"
            class="px-6 py-5 flex items-start gap-4 hover:bg-surface-hover/50 transition-colors"
          >
            <div 
              class="w-2 h-2 rounded-full mt-2 shrink-0"
              :class="{
                'bg-green-400': activity.status === 'success',
                'bg-yellow-400': activity.status === 'warning',
                'bg-blue-400': activity.status === 'pending'
              }"
            ></div>
            <div>
              <p class="font-medium text-text">{{ activity.patient }}</p>
              <p class="text-sm text-text-muted mt-0.5">{{ activity.action }}</p>
              <p class="text-xs text-text-muted mt-2">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes waveGlow {
  0%, 100% {
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }
  15%, 25% {
    border-color: color-mix(in srgb, var(--color-primary) 60%, transparent);
    box-shadow: 0 0 30px -5px color-mix(in srgb, var(--color-primary) 30%, transparent);
  }
}

.animate-wave-glow {
  animation: waveGlow 4s infinite;
}

@keyframes iconGlow {
  0%, 100% {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
    color: var(--color-primary);
  }
  15%, 25% {
    background-color: var(--color-primary);
    color: white;
  }
}

.animate-icon-glow {
  animation: iconGlow 4s infinite;
}
</style>
