<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Sparkles, Activity, Clock, Calendar } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const router = useRouter()
const route = useRoute()

// Mock data
const patientName = ref('Sarah Jenkins')
const sessionDate = ref('October 24, 2023')
const sessionType = ref('VR Exposure Therapy')
const duration = ref('45 minutes')

// AI Summary mock
const aiSummary = ref(`Based on the physiological data collected during the VR exposure session, the patient showed an initial spike in heart rate (peaking at 110 BPM) during the first 10 minutes of exposure to the target stimuli. However, physiological indicators (HR and EDA) stabilized significantly in the latter half of the session, returning to a baseline of 75 BPM. The Heart Rate Variability (HRV) increased steadily towards the end, indicating successful parasympathetic nervous system engagement and an overall positive response to the relaxation techniques applied post-exposure. The session was highly effective.`)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#8B9BB4' } },
    x: { grid: { display: false }, ticks: { color: '#8B9BB4' } }
  },
  plugins: { legend: { display: false } }
}

const hrData = {
  labels: ['0m', '5m', '10m', '15m', '20m', '25m', '30m', '35m', '40m', '45m'],
  datasets: [{
    label: 'Heart Rate (BPM)',
    data: [72, 85, 110, 105, 95, 88, 80, 76, 75, 74],
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 2,
    fill: true,
    tension: 0.4
  }]
}

const hrvData = {
  labels: ['0m', '5m', '10m', '15m', '20m', '25m', '30m', '35m', '40m', '45m'],
  datasets: [{
    label: 'HRV (ms)',
    data: [45, 42, 30, 35, 48, 55, 62, 65, 68, 70],
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 2,
    fill: true,
    tension: 0.4
  }]
}

const edaData = {
  labels: ['0m', '5m', '10m', '15m', '20m', '25m', '30m', '35m', '40m', '45m'],
  datasets: [{
    label: 'EDA (μS)',
    data: [2.1, 3.4, 5.8, 5.2, 4.1, 3.5, 2.8, 2.5, 2.3, 2.2],
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 2,
    fill: true,
    tension: 0.4
  }]
}
</script>

<template>
  <div class="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
    <!-- Decorative background elements -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none z-0"></div>

    <div class="relative z-10 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button 
          @click="router.push('/consultations')"
          class="p-2 bg-surface/50 backdrop-blur-xl border border-white/10 hover:border-primary/50 hover:text-primary text-text rounded-xl transition-all shadow-lg shadow-black/20"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-text">Consultation Details: {{ patientName }}</h1>
          <div class="flex items-center gap-4 mt-1 text-text-muted text-sm">
            <span class="flex items-center gap-1"><Calendar class="w-4 h-4"/> {{ sessionDate }}</span>
            <span class="flex items-center gap-1"><Clock class="w-4 h-4"/> {{ duration }}</span>
            <span class="flex items-center gap-1"><Activity class="w-4 h-4"/> {{ sessionType }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Summary Section -->
    <div class="relative z-10 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/20 group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
      <div class="flex items-center gap-2 mb-4">
        <div class="p-2 rounded-lg bg-primary/10 text-primary">
          <Sparkles class="w-5 h-5" />
        </div>
        <h2 class="text-xl font-semibold text-text">AI Session Analysis</h2>
      </div>
      <p class="text-text-muted leading-relaxed">
        {{ aiSummary }}
      </p>
    </div>

    <!-- Historical Data Charts -->
    <div class="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[300px]">
      <div class="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-lg shadow-black/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
        <h3 class="text-sm font-medium text-text-muted mb-4">Heart Rate Progression (BPM)</h3>
        <div class="flex-1 relative min-h-[250px]">
          <Line :data="hrData" :options="chartOptions" />
        </div>
      </div>
      
      <div class="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-lg shadow-black/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
        <h3 class="text-sm font-medium text-text-muted mb-4">Electrodermal Activity (μS)</h3>
        <div class="flex-1 relative min-h-[250px]">
          <Line :data="edaData" :options="chartOptions" />
        </div>
      </div>
      
      <div class="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-lg shadow-black/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
        <h3 class="text-sm font-medium text-text-muted mb-4">Heart Rate Variability (ms)</h3>
        <div class="flex-1 relative min-h-[250px]">
          <Line :data="hrvData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>
