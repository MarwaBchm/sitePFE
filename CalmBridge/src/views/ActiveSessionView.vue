<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Activity, Heart, Zap, StopCircle } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const route = useRoute()
const router = useRouter()
const isSessionActive = ref(true)
const sessionTime = ref(0)
const timer = ref(null)

// Mock patient details based on ID
const patientId = route.params.id
const patientName = ref('Sarah Jenkins')

// Chart configurations
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  scales: {
    y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
    x: { grid: { display: false }, ticks: { display: false } }
  },
  plugins: { legend: { display: false } }
}

const createChartData = (label, color, bgColor) => ({
  labels: Array(50).fill(''),
  datasets: [{
    label,
    data: Array(50).fill(0),
    borderColor: color,
    backgroundColor: bgColor,
    borderWidth: 2,
    pointRadius: 0,
    fill: true,
    tension: 0.4
  }]
})

const hrData = ref(createChartData('Heart Rate (BPM)', '#ef4444', 'rgba(239, 68, 68, 0.1)'))
const hrvData = ref(createChartData('HRV (ms)', '#3b82f6', 'rgba(59, 130, 246, 0.1)'))
const edaData = ref(createChartData('EDA (μS)', '#8b5cf6', 'rgba(139, 92, 246, 0.1)'))

// Current values for display
const currentHR = ref(72)
const currentHRV = ref(45)
const currentEDA = ref(2.4)

// Simulated real-time data update
const updateData = () => {
  if (!isSessionActive.value) return

  const updateChart = (chartRef, currentValueRef, baseValue, variance) => {
    const newVal = baseValue + (Math.random() * variance * 2 - variance)
    currentValueRef.value = Number(newVal.toFixed(1))
    
    const dataCopy = { ...chartRef.value }
    const dataset = dataCopy.datasets[0]
    dataset.data.shift()
    dataset.data.push(currentValueRef.value)
    chartRef.value = dataCopy
  }

  updateChart(hrData, currentHR, 75, 10)
  updateChart(hrvData, currentHRV, 45, 5)
  updateChart(edaData, currentEDA, 2.5, 0.5)
}

let dataInterval
onMounted(() => {
  // Initialize with some mock history
  for(let i = 0; i < 50; i++) updateData()
  
  dataInterval = setInterval(updateData, 1000)
  timer.value = setInterval(() => {
    if (isSessionActive.value) sessionTime.value++
  }, 1000)
})

onUnmounted(() => {
  clearInterval(dataInterval)
  clearInterval(timer.value)
})

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const toggleSession = () => {
  isSessionActive.value = !isSessionActive.value
}
</script>

<template>
  <div class="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button 
          @click="router.back()"
          class="p-2 bg-surface hover:bg-surface-hover text-text rounded-xl border border-border transition-colors"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-white">Active Session: {{ patientName }}</h1>
          <p class="text-text-muted flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></span>
            {{ isSessionActive ? 'Recording in progress' : 'Session paused' }} • {{ formatTime(sessionTime) }}
          </p>
        </div>
      </div>
      
      <button 
        @click="toggleSession"
        class="px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg"
        :class="isSessionActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'"
      >
        <StopCircle class="w-5 h-5" v-if="isSessionActive" />
        <Activity class="w-5 h-5" v-else />
        {{ isSessionActive ? 'End Session' : 'Resume Session' }}
      </button>
    </div>

    <!-- Live Metrics Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
          <Heart class="w-6 h-6" :class="{'animate-pulse': isSessionActive}" />
        </div>
        <div>
          <p class="text-text-muted text-sm">Heart Rate</p>
          <p class="text-2xl font-bold text-white">{{ currentHR.toFixed(0) }} <span class="text-sm font-normal text-text-muted">BPM</span></p>
        </div>
      </div>
      <div class="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
          <Activity class="w-6 h-6" />
        </div>
        <div>
          <p class="text-text-muted text-sm">HRV</p>
          <p class="text-2xl font-bold text-white">{{ currentHRV.toFixed(0) }} <span class="text-sm font-normal text-text-muted">ms</span></p>
        </div>
      </div>
      <div class="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
          <Zap class="w-6 h-6" />
        </div>
        <div>
          <p class="text-text-muted text-sm">Electrodermal Activity</p>
          <p class="text-2xl font-bold text-white">{{ currentEDA.toFixed(2) }} <span class="text-sm font-normal text-text-muted">μS</span></p>
        </div>
      </div>
    </div>

    <!-- Real-time Charts -->
    <div class="flex-1 grid grid-rows-3 gap-6">
      <div class="bg-surface border border-border rounded-2xl p-4 flex flex-col">
        <h3 class="text-sm font-medium text-text-muted mb-2 px-2">Heart Rate Timeline</h3>
        <div class="flex-1 relative min-h-[120px]">
          <Line :data="hrData" :options="chartOptions" />
        </div>
      </div>
      <div class="bg-surface border border-border rounded-2xl p-4 flex flex-col">
        <h3 class="text-sm font-medium text-text-muted mb-2 px-2">Heart Rate Variability Timeline</h3>
        <div class="flex-1 relative min-h-[120px]">
          <Line :data="hrvData" :options="chartOptions" />
        </div>
      </div>
      <div class="bg-surface border border-border rounded-2xl p-4 flex flex-col">
        <h3 class="text-sm font-medium text-text-muted mb-2 px-2">Electrodermal Activity Timeline</h3>
        <div class="flex-1 relative min-h-[120px]">
          <Line :data="edaData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>
