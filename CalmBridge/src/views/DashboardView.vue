<script setup>
import { Users, Activity, Clock, TrendingUp } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const stats = [
  { name: 'Total Patients', value: '124', icon: Users, change: '+12%', changeType: 'positive' },
  { name: 'Active Sessions', value: '12', icon: Activity, change: '+4%', changeType: 'positive' },
  { name: 'Avg. Session Time', value: '45m', icon: Clock, change: '-2%', changeType: 'negative' },
  { name: 'Success Rate', value: '94%', icon: TrendingUp, change: '+1%', changeType: 'positive' },
]

const recentActivity = [
  { id: 1, patient: 'Sarah Jenkins', action: 'Completed VR Exposure Therapy', time: '2 hours ago', status: 'success' },
  { id: 2, patient: 'Michael Chen', action: 'Scheduled new consultation', time: '4 hours ago', status: 'pending' },
  { id: 3, patient: 'Emma Thompson', action: 'High anxiety detected during session', time: '5 hours ago', status: 'warning' },
]

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
      <h1 class="text-3xl font-bold tracking-tight text-white">Overview</h1>
      <p class="text-text-muted mt-2">Welcome back, Dr. Smith. Here's what's happening today.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="stat in stats" 
        :key="stat.name"
        class="bg-surface rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors duration-300 group"
      >
        <div class="flex items-center justify-between">
          <div class="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
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
          <p class="text-3xl font-bold text-white mt-1">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart -->
      <div class="bg-surface rounded-2xl border border-border overflow-hidden lg:col-span-2 flex flex-col">
        <div class="px-6 py-5 border-b border-border flex justify-between items-center">
          <h2 class="text-xl font-semibold text-white">Consultation Activity</h2>
        </div>
        <div class="p-6 flex-1 min-h-[300px]">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-surface rounded-2xl border border-border overflow-hidden">
        <div class="px-6 py-5 border-b border-border">
          <h2 class="text-xl font-semibold text-white">Recent Activity</h2>
        </div>
        <div class="divide-y divide-border">
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
              <p class="font-medium text-white">{{ activity.patient }}</p>
              <p class="text-sm text-text-muted mt-0.5">{{ activity.action }}</p>
              <p class="text-xs text-text-muted mt-2">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
