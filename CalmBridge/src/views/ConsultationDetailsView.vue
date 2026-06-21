<script setup>
import { ref , computed, onMounted,watch} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Sparkles, Activity, Clock, Calendar } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { useRealtimeData } from '../composables/useRealtimeData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const router = useRouter()
const route = useRoute()

const patient = ref(null)

const { realtimeStudents } =
  useRealtimeData()

const livePatient = computed(() => {

  if (!patient.value)
    return null

  return realtimeStudents.value.find(
    s =>
      s.studentId === patient.value.id
  )
})
const patientName = computed(() => {

  if (!patient.value)
    return 'Loading...'

  return `${patient.value.user?.firstName}
          ${patient.value.user?.lastName}`
})

const aiSummary = ref(
  'Real-time monitoring session in progress. AI analysis will appear here when session data becomes available.'
)

const sessionDate = ref(
  new Date().toLocaleDateString()
)

const duration = ref(
  'Live Session'
)

const sessionType = ref(
  'Stress Monitoring'
)
const token = localStorage.getItem('token')
onMounted(async () => {
 console.log(route.params.id)
  try {
   
    const res = await fetch(
      `http://localhost:3000/students/${route.params.id}`,  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
    )

    patient.value =
      await res.json()
    console.log(patient.value)

  } catch (err) {

    console.error(err)
  }
})
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#8B9BB4' } },
    x: { grid: { display: false }, ticks: { color: '#8B9BB4' } }
  },
  plugins: { legend: { display: false } }
}

const hrLabels = ref([])
const hrValues = ref([])

const hrvLabels = ref([])
const hrvValues = ref([])

const gsrLabels = ref([])
const gsrValues = ref([])
watch(
  livePatient,
  (data) => {

    if (!data)
      return

    const time =
      new Date()
        .toLocaleTimeString()

    hrLabels.value.push(time)
    hrValues.value.push(data.heartRate)

    hrvLabels.value.push(time)
    hrvValues.value.push(data.hrv)

    gsrLabels.value.push(time)
    gsrValues.value.push(data.gsr)

    if (hrLabels.value.length > 20) {

      hrLabels.value.shift()
      hrValues.value.shift()

      hrvLabels.value.shift()
      hrvValues.value.shift()

      gsrLabels.value.shift()
      gsrValues.value.shift()
    }

  },
  { deep: true }
)
const hrData = computed(() => ({
  labels: hrLabels.value,
  datasets: [{
    data: hrValues.value,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,.1)',
    fill: true,
    tension: .4
  }]
}))

const hrvData = computed(() => ({
  labels: hrvLabels.value,
  datasets: [{
    data: hrvValues.value,
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139,92,246,.1)',
    fill: true,
    tension: .4
  }]
}))

const edaData = computed(() => ({
  labels: gsrLabels.value,
  datasets: [{
    data: gsrValues.value,
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59,130,246,.1)',
    fill: true,
    tension: .4
  }]
}))
</script>

<template>
  <div class="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
    <!-- Decorative background elements -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none z-0"></div>

    <div class="relative z-10 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button 
          @click="router.push('/MonitoringDashboard')"
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
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

  <div class="bg-surface rounded-xl p-4">
    <p class="text-text-muted text-sm">
      Heart Rate
    </p>

    <p class="text-2xl font-bold">
      {{ livePatient?.heartRate ?? '--' }}
    </p>
  </div>

  <div class="bg-surface rounded-xl p-4">
    <p class="text-text-muted text-sm">
      HRV
    </p>

    <p class="text-2xl font-bold">
      {{ livePatient?.hrv ?? '--' }}
    </p>
  </div>

  <div class="bg-surface rounded-xl p-4">
    <p class="text-text-muted text-sm">
      GSR
    </p>

    <p class="text-2xl font-bold">
      {{ livePatient?.gsr ?? '--' }}
    </p>
  </div>

  <div class="bg-surface rounded-xl p-4">
    <p class="text-text-muted text-sm">
      Stress
    </p>

    <p class="text-2xl font-bold">
      {{ livePatient?.stressLevel ?? '--' }}
    </p>
  </div>

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
