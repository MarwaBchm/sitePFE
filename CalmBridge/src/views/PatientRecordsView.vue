<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import {
  ArrowLeft,
  Activity,
  Heart,
  AlertTriangle,
  ClipboardList,
  Calendar,
  Plus,
  Edit,
  Trash2,
  FileText,
  TrendingUp,
  Download,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart2,
  BookOpen,
  User,
  Loader2,
} from 'lucide-vue-next'
import {
  getPatientById,
  getPatientSessions,
  createSession,
  updateSession,
  deleteSession,
} from '../services/recordsService.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// ─── Router ──────────────────────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()
const patientId = route.params.id

// ─── State ───────────────────────────────────────────────────────────────────
const patient = ref(null)
const consultations = ref([])
const sessions = ref([])
const loading = ref(true)
const error = ref(null)

// ─── Modal ───────────────────────────────────────────────────────────────────
const showModal = ref(false)
const editingConsultation = ref(null)
const saving = ref(false)
const form = ref({
  summary: '',
  observations: '',
  recommendations: '',
  stressAssessment: 'BASELINE',
})

// ─── Table state ─────────────────────────────────────────────────────────────
const sessionSearch = ref('')
const sortKey = ref('date')
const sortDir = ref('desc')
const currentPage = ref(1)
const pageSize = 10

// ─── Computed: patient initials ───────────────────────────────────────────────
const initials = computed(() => {
  if (!patient.value?.user) return '?'

  return `${patient.value.user.firstName?.[0] || ''}${patient.value.user.lastName?.[0] || ''}`.toUpperCase()
})

const fullName = computed(() =>
  patient.value
    ? `${patient.value.user?.firstName || ''} ${patient.value.user?.lastName || ''}`
    : '—'
)

// ─── Computed: stats ──────────────────────────────────────────────────────────
const avgStress = computed(() => {
  if (!sessions.value.length) return '—'
  const scores = sessions.value.map(s => parseFloat(s.stressScore ?? s.avgStressScore ?? 0))
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
})

const avgHR = computed(() => {
  if (!sessions.value.length) return '—'
  const hrs = sessions.value.map(s => parseFloat(s.avgHeartRate ?? s.heartRate ?? 0))
  return Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length)
})

const highStressEpisodes = computed(() =>
  sessions.value.filter(s => (s.stressLevel ?? s.stressScore) === 'HIGH_STRESS' || parseFloat(s.stressScore ?? 0) > 70).length
)

const lastSessionDate = computed(() => {
  if (!sessions.value.length) return '—'
  const sorted = [...sessions.value].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
  return formatDate(sorted[0].date || sorted[0].createdAt)
})

// ─── Stress badge helper ──────────────────────────────────────────────────────
const currentStressLevel = computed(() => {
  if (!sessions.value.length) return 'BASELINE'
  const last = [...sessions.value].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))[0]
  return last.stressLevel ?? (parseFloat(last.stressScore ?? 0) > 70 ? 'HIGH_STRESS' : parseFloat(last.stressScore ?? 0) > 40 ? 'MILD_STRESS' : 'BASELINE')
})

const stressBadgeClass = computed(() => {
  const level = currentStressLevel.value
  if (level === 'HIGH_STRESS') return 'bg-red-500/10 text-red-400 border border-red-500/20'
  if (level === 'MILD_STRESS') return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
  return 'bg-green-500/10 text-green-400 border border-green-500/20'
})

function stressLevelBadge(level) {
  if (level === 'HIGH_STRESS') return 'bg-red-500/10 text-red-400'
  if (level === 'MILD_STRESS') return 'bg-yellow-500/10 text-yellow-400'
  return 'bg-green-500/10 text-green-400'
}

function stressScoreBadge(score) {
  const n = parseFloat(score ?? 0)
  if (n > 70) return 'bg-red-500/10 text-red-400'
  if (n > 40) return 'bg-yellow-500/10 text-yellow-400'
  return 'bg-green-500/10 text-green-400'
}

// ─── Chart data ───────────────────────────────────────────────────────────────
const chartData = computed(() => {
  const sorted = [...sessions.value]
    .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))
    .slice(-12)

  return {
    labels: sorted.map(s => formatDate(s.date || s.createdAt, true)),
    datasets: [
      {
        label: 'Stress Score',
        data: sorted.map(s => parseFloat(s.stressScore ?? s.avgStressScore ?? 0)),
        borderColor: '#5271FF',
        backgroundColor: (ctx) => {
          const chart = ctx.chart
          const { ctx: canvasCtx, chartArea } = chart
          if (!chartArea) return 'rgba(82,113,255,0.1)'
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, 'rgba(82,113,255,0.3)')
          gradient.addColorStop(1, 'rgba(82,113,255,0.0)')
          return gradient
        },
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#5271FF',
        pointBorderColor: '#0B0E14',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: {
      min: 0,
      max: 100,
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#8B9BB4', font: { size: 12 } },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#8B9BB4', font: { size: 11 }, maxRotation: 30 },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1F2633',
      borderColor: '#262D3D',
      borderWidth: 1,
      titleColor: '#F8FAFC',
      bodyColor: '#8B9BB4',
      padding: 12,
    },
  },
}

// ─── Session table ────────────────────────────────────────────────────────────
const filteredSessions = computed(() => {
  let list = [...sessions.value]
  if (sessionSearch.value) {
    const q = sessionSearch.value.toLowerCase()
    list = list.filter(s =>
      formatDate(s.date || s.createdAt).toLowerCase().includes(q) ||
      String(s.stressLevel || '').toLowerCase().includes(q)
    )
  }
  list.sort((a, b) => {
    let va, vb
    if (sortKey.value === 'date') {
      va = new Date(a.date || a.createdAt || 0)
      vb = new Date(b.date || b.createdAt || 0)
    } else if (sortKey.value === 'heartRate') {
      va = parseFloat(a.avgHeartRate ?? a.heartRate ?? 0)
      vb = parseFloat(b.avgHeartRate ?? b.heartRate ?? 0)
    } else if (sortKey.value === 'stressScore') {
      va = parseFloat(a.stressScore ?? a.avgStressScore ?? 0)
      vb = parseFloat(b.stressScore ?? b.avgStressScore ?? 0)
    } else {
      va = a[sortKey.value] ?? ''
      vb = b[sortKey.value] ?? ''
    }
    return sortDir.value === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
  })
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredSessions.value.length / pageSize)))
const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSessions.value.slice(start, start + pageSize)
})

function sortBy(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'desc' }
}

watch(sessionSearch, () => { currentPage.value = 1 })

// ─── Date helpers ─────────────────────────────────────────────────────────────
function formatDate(val, short = false) {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d)) return String(val)
  if (short) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(val) {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d)) return String(val)
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─── Data fetch ───────────────────────────────────────────────────────────────
async function fetchAll() {
  loading.value = true

  try {
    const [pRes, sRes] = await Promise.all([
      getPatientById(patientId),
      getPatientSessions(patientId),
    ])

    console.log('PATIENT', pRes.data)
    console.log('SESSIONS', sRes.data)

    patient.value = pRes.data

    consultations.value = sRes.data || []
    sessions.value = sRes.data || []

  } catch (e) {
    console.error(e)
    error.value = e
  } finally {
    loading.value = false
  }
}
onMounted(fetchAll)

// ─── Consultation modal ───────────────────────────────────────────────────────
function openAddModal() {
  editingConsultation.value = null
  form.value = { summary: '', observations: '', recommendations: '', stressAssessment: 'BASELINE' }
  showModal.value = true
}

function openEditModal(c) {
  editingConsultation.value = c
  form.value = {
    summary: c.summary ?? c.sessionSummary ?? '',
    observations: c.observations ?? '',
    recommendations: c.recommendations ?? '',
    stressAssessment: c.stressAssessment ?? 'BASELINE',
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingConsultation.value = null
}
const user = JSON.parse(localStorage.getItem('user'))
async function saveConsultation() {

  saving.value = true
  try {
    const payload = {
      studentId: Number(patientId),
      therapistId: Number(user.id),
      sessionSummary: form.value.summary,
      observations: form.value.observations,
      recommendations: form.value.recommendations,
      stressAssessment: form.value.stressAssessment,
    }
    if (editingConsultation.value) {
      console.log('PAYLOAD', payload)
      await updateSession(editingConsultation.value.id, payload)
    } else {
      await createSession(payload)
    }
    closeModal()
    const cRes = await getPatientSessions(patientId)
    consultations.value = cRes.data.items ?? []
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function deleteC(c) {
  if (!confirm(`Delete this consultation from ${formatDate(c.createdAt || c.date)}?`)) return
  try {
    await deleteSession(c.id)
    const cRes = await getPatientSessions(patientId)
    consultations.value = cRes.data ?? []
  } catch (e) {
    console.error(e)
  }
}

// ─── PDF Export ───────────────────────────────────────────────────────────────
async function generateReport(type) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W = doc.internal.pageSize.getWidth()
  let y = 0

  // Header bar
  doc.setFillColor(82, 113, 255)
  doc.rect(0, 0, W, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CalmBridge Mental Health Platform', 14, 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(type, 14, 21)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, W - 14, 21, { align: 'right' })

  y = 38

  // Patient Info
  doc.setTextColor(11, 14, 20)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Patient Information', 14, y)
  y += 6
  doc.setLineWidth(0.4)
  doc.setDrawColor(82, 113, 255)
  doc.line(14, y, W - 14, y)
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)

  const p = patient.value
  const infoLines = [
    [`Name:`, fullName.value],
    [`Age:`, `${p?.age ?? '—'} years`],
    [`Diagnosis:`, p?.diagnosis ?? '—'],
    [`Patient ID:`, `#${patientId}`],
    [`Last Session:`, lastSessionDate.value],
    [`Total Consultations:`, String(consultations.value.length)],
  ]
  infoLines.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 14, y)
    doc.setFont('helvetica', 'normal')
    doc.text(val, 60, y)
    y += 6
  })

  if (type !== 'Consultation Report') {
    y += 4
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(11, 14, 20)
    doc.text('Monitoring Statistics', 14, y)
    y += 6
    doc.setLineWidth(0.4)
    doc.setDrawColor(82, 113, 255)
    doc.line(14, y, W - 14, y)
    y += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)

    const statsLines = [
      ['Average Stress Score:', String(avgStress.value)],
      ['Average Heart Rate:', `${avgHR.value} BPM`],
      ['High Stress Episodes:', String(highStressEpisodes.value)],
      ['Total Sessions:', String(sessions.value.length)],
    ]
    statsLines.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 14, y)
      doc.setFont('helvetica', 'normal')
      doc.text(val, 80, y)
      y += 6
    })
  }

  if (type !== 'Progress Report') {
    y += 4
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(11, 14, 20)
    doc.text('Consultation History', 14, y)
    y += 6
    doc.setLineWidth(0.4)
    doc.setDrawColor(82, 113, 255)
    doc.line(14, y, W - 14, y)
    y += 6

    consultations.value.slice(0, 10).forEach((c, i) => {
      if (y > 260) { doc.addPage(); y = 20 }
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(50, 50, 50)
      doc.text(`${i + 1}. ${formatDate(c.createdAt || c.date)}  —  ${c.stressAssessment ?? ''}`, 14, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const summary = c.sessionSummary ?? c.summary ?? 'No summary recorded.'
      const wrapped = doc.splitTextToSize(summary, W - 28)
      doc.text(wrapped, 14, y)
      y += wrapped.length * 4.5 + 4
    })
  }

  doc.save(`CalmBridge_${type.replace(/ /g, '_')}_${fullName.value.replace(/ /g, '_')}.pdf`)
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
    <!-- Decorative BG blobs -->
    <div class="absolute top-0 left-[-5%] w-[35%] h-[35%] rounded-full bg-primary/8 blur-[120px] pointer-events-none z-0"></div>
    <div class="absolute bottom-0 right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-500/8 blur-[120px] pointer-events-none z-0"></div>

    <!-- ═══════════════════════════════════════════ LOADING / ERROR ══════════ -->
    <div v-if="loading" class="relative z-10 flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 class="w-10 h-10 text-primary animate-spin" />
      <p class="text-text-muted">Loading patient records…</p>
    </div>

    <template v-else>
      <!-- ═══════════════════════════════════════════ HEADER ══════════════════ -->
      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/20">
        <!-- Back button -->
        <button
          @click="router.push('/patients')"
          id="btn-back-patients"
          class="absolute top-5 left-5 p-2 bg-surface border border-border hover:border-primary/60 hover:text-primary text-text-muted rounded-xl transition-all"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>

        <!-- Avatar + Info -->
        <div class="flex items-center gap-5 mt-8 lg:mt-0 lg:ml-10">
          <div class="relative shrink-0">
            <div class="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/30">
              {{ initials }}
            </div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface"
              :class="currentStressLevel === 'HIGH_STRESS' ? 'bg-red-500' : currentStressLevel === 'MILD_STRESS' ? 'bg-yellow-500' : 'bg-green-500'">
            </div>
          </div>
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-2xl font-bold text-text">{{ fullName }}</h1>
              <span class="text-xs px-2.5 py-1 rounded-full font-medium" :class="stressBadgeClass">
                {{ currentStressLevel.replace('_', ' ') }}
              </span>
            </div>
            <p class="text-text-muted mt-1 text-sm">
              {{ patient?.age ?? '—' }} years old
              <span class="mx-2 text-border">·</span>
              {{ patient?.diagnosis ?? 'No diagnosis' }}
            </p>
            <p class="text-text-muted text-xs mt-1 flex items-center gap-2">
              <span>ID #{{ patientId }}</span>
              <span class="text-border">·</span>
              <span>Last session: {{ lastSessionDate }}</span>
            </p>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-wrap items-center gap-3 lg:ml-auto">
          <button
            id="btn-add-consultation"
            @click="openAddModal"
            class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10 text-sm"
          >
            <Plus class="w-4 h-4" />
            Add Consultation
          </button>
          <button
            id="btn-generate-report"
            @click="generateReport('Full Patient Report')"
            class="flex items-center gap-2 bg-surface border border-border hover:border-primary/50 hover:text-primary text-text px-4 py-2.5 rounded-xl font-medium transition-all text-sm"
          >
            <TrendingUp class="w-4 h-4" />
            Generate Report
          </button>
          <button
            id="btn-export-pdf"
            @click="generateReport('Full Patient Report')"
            class="flex items-center gap-2 bg-surface border border-border hover:border-primary/50 hover:text-primary text-text px-4 py-2.5 rounded-xl font-medium transition-all text-sm"
          >
            <Download class="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <!-- ════════════════════════════════════════ STATS CARDS ══════════════════ -->
      <div class="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <!-- Avg Stress -->
        <div class="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary transition-all duration-300">
            <Activity class="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" />
          </div>
          <p class="text-2xl font-bold text-text">{{ avgStress }}</p>
          <p class="text-text-muted text-xs mt-1">Avg Stress Score</p>
        </div>

        <!-- Avg HR -->
        <div class="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 group">
          <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-3 group-hover:bg-red-500 transition-all duration-300">
            <Heart class="w-5 h-5 text-red-400 group-hover:text-white transition-colors duration-300" />
          </div>
          <p class="text-2xl font-bold text-text">{{ avgHR }}<span class="text-sm font-normal text-text-muted ml-1">BPM</span></p>
          <p class="text-text-muted text-xs mt-1">Avg Heart Rate</p>
        </div>

        <!-- High Stress Episodes -->
        <div class="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 group">
          <div class="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3 group-hover:bg-yellow-500 transition-all duration-300">
            <AlertTriangle class="w-5 h-5 text-yellow-400 group-hover:text-white transition-colors duration-300" />
          </div>
          <p class="text-2xl font-bold text-text">{{ highStressEpisodes }}</p>
          <p class="text-text-muted text-xs mt-1">High Stress Episodes</p>
        </div>

        <!-- Total Consultations -->
        <div class="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 group">
          <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-3 group-hover:bg-green-500 transition-all duration-300">
            <ClipboardList class="w-5 h-5 text-green-400 group-hover:text-white transition-colors duration-300" />
          </div>
          <p class="text-2xl font-bold text-text">{{ consultations.length }}</p>
          <p class="text-text-muted text-xs mt-1">Total Consultations</p>
        </div>

        <!-- Last Session -->
        <div class="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group">
          <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:bg-purple-500 transition-all duration-300">
            <Calendar class="w-5 h-5 text-purple-400 group-hover:text-white transition-colors duration-300" />
          </div>
          <p class="text-lg font-bold text-text leading-tight">{{ lastSessionDate }}</p>
          <p class="text-text-muted text-xs mt-1">Last Session</p>
        </div>
      </div>

      <!-- ════════════════════════════════════════ STRESS TREND CHART ══════════ -->
      <div class="relative z-10 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-black/20 hover:border-primary/30 transition-colors duration-300 overflow-hidden">
        <div class="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-text flex items-center gap-2">
              <BarChart2 class="w-5 h-5 text-primary" />
              Stress Trend
            </h2>
            <p class="text-text-muted text-sm mt-0.5">Stress scores over monitoring sessions</p>
          </div>
          <span class="text-xs text-text-muted bg-surface-hover px-3 py-1 rounded-full border border-border">
            {{ sessions.length }} sessions
          </span>
        </div>
        <div class="p-6">
          <div v-if="sessions.length === 0" class="flex flex-col items-center justify-center py-16 text-text-muted gap-3">
            <BarChart2 class="w-8 h-8 opacity-40" />
            <p class="text-sm">No monitoring sessions recorded yet.</p>
          </div>
          <div v-else class="h-[280px]">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════ CONSULTATION TIMELINE ══════════ -->
      <div class="relative z-10 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-black/20 overflow-hidden">
        <div class="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-text flex items-center gap-2">
              <BookOpen class="w-5 h-5 text-primary" />
              Consultation Notes
            </h2>
            <p class="text-text-muted text-sm mt-0.5">Therapist notes and session observations</p>
          </div>
          <button
            @click="openAddModal"
            id="btn-add-consultation-timeline"
            class="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus class="w-4 h-4" />
            Add Note
          </button>
        </div>

        <div class="p-6">
          <!-- Empty state -->
          <div v-if="consultations.length === 0" class="flex flex-col items-center justify-center py-16 text-text-muted gap-3">
            <BookOpen class="w-8 h-8 opacity-40" />
            <p class="text-sm">No consultation notes yet. Add the first one!</p>
            <button @click="openAddModal" class="text-primary text-sm hover:underline flex items-center gap-1">
              <Plus class="w-3.5 h-3.5" /> Add Consultation
            </button>
          </div>

          <!-- Timeline -->
          <div v-else class="relative">
            <!-- Vertical line -->
            <div class="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/60 via-primary/20 to-transparent rounded-full"></div>

            <div class="space-y-6">
              <div
                v-for="(c, i) in consultations"
                :key="c.id ?? i"
                class="relative pl-12 group"
              >
                <!-- Timeline dot -->
                <div class="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-primary border-2 border-surface shadow-lg shadow-primary/40 group-hover:scale-125 transition-transform"></div>

                <!-- Card -->
                <div class="bg-surface border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                  <div class="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-sm font-semibold text-text">
                          {{ formatDateTime(c.createdAt || c.date) }}
                        </span>
                        <span
                          class="text-xs px-2 py-0.5 rounded-full font-medium"
                          :class="stressLevelBadge(c.stressAssessment)"
                        >
                          {{ (c.stressAssessment ?? 'BASELINE').replace('_', ' ') }}
                        </span>
                      </div>
                      <p class="text-text-muted text-xs mt-0.5 flex items-center gap-1">
                        <User class="w-3 h-3" />
                        Dr. {{ c.therapistName ?? 'Therapist' }}
                      </p>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        @click="openEditModal(c)"
                        :id="`btn-edit-consultation-${c.id}`"
                        class="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit class="w-4 h-4" />
                      </button>
                      <button
                        @click="deleteC(c)"
                        :id="`btn-delete-consultation-${c.id}`"
                        class="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div class="mt-4 space-y-3">
                    <div v-if="c.sessionSummary || c.summary">
                      <p class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Session Summary</p>
                      <p class="text-sm text-text leading-relaxed">{{ c.sessionSummary ?? c.summary }}</p>
                    </div>
                    <div v-if="c.observations">
                      <p class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Observations</p>
                      <p class="text-sm text-text leading-relaxed">{{ c.observations }}</p>
                    </div>
                    <div v-if="c.recommendations">
                      <p class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Recommendations</p>
                      <p class="text-sm text-text leading-relaxed">{{ c.recommendations }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════ SESSION HISTORY TABLE ═══════════ -->
      <div class="relative z-10 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-black/20 overflow-hidden">
        <div class="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-text flex items-center gap-2">
              <Activity class="w-5 h-5 text-primary" />
              Session History
            </h2>
            <p class="text-text-muted text-sm mt-0.5">All recorded monitoring sessions</p>
          </div>
          <!-- Search -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              v-model="sessionSearch"
              id="session-search"
              type="text"
              placeholder="Search sessions…"
              class="bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-52"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-surface-hover/30 border-b border-border">
              <tr>
                <th
                  v-for="col in [
                    { key: 'date', label: 'Date' },
                    { key: 'heartRate', label: 'Avg Heart Rate' },
                    { key: 'stressScore', label: 'Stress Score' },
                    { key: 'stressLevel', label: 'Stress Level' },
                    { key: 'duration', label: 'Duration' },
                  ]"
                  :key="col.key"
                  @click="sortBy(col.key)"
                  class="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text select-none transition-colors"
                >
                  <div class="flex items-center gap-1">
                    {{ col.label }}
                    <span class="flex flex-col">
                      <ChevronUp class="w-3 h-3" :class="sortKey === col.key && sortDir === 'asc' ? 'text-primary' : 'text-border'" />
                      <ChevronDown class="w-3 h-3 -mt-1" :class="sortKey === col.key && sortDir === 'desc' ? 'text-primary' : 'text-border'" />
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="paginatedSessions.length === 0">
                <td colspan="5" class="px-6 py-16 text-center text-text-muted text-sm">
                  <Activity class="w-8 h-8 opacity-30 mx-auto mb-3" />
                  No sessions found.
                </td>
              </tr>
              <tr
                v-for="s in paginatedSessions"
                :key="s.id ?? s.sessionId"
                class="hover:bg-surface-hover/30 transition-colors"
              >
                <td class="px-6 py-4 text-sm text-text">{{ formatDate(s.date || s.createdAt) }}</td>
                <td class="px-6 py-4 text-sm text-text">
                  {{ s.avgHeartRate ?? s.heartRate ?? '—' }}
                  <span class="text-text-muted text-xs ml-1">BPM</span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-medium" :class="stressScoreBadge(s.stressScore ?? s.avgStressScore)">
                    {{ s.stressScore ?? s.avgStressScore ?? '—' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-medium" :class="stressLevelBadge(s.stressLevel)">
                    {{ (s.stressLevel ?? 'BASELINE').replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-text-muted">
                  {{ s.duration ? `${s.duration} min` : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-border flex items-center justify-between gap-4">
          <p class="text-xs text-text-muted">
            Showing {{ paginatedSessions.length }} of {{ filteredSessions.length }} sessions
          </p>
          <div class="flex items-center gap-2">
            <button
              id="btn-prev-page"
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="p-1.5 rounded-lg border border-border text-text-muted hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <span class="text-sm text-text min-w-[80px] text-center">
              Page {{ currentPage }} / {{ totalPages }}
            </span>
            <button
              id="btn-next-page"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="p-1.5 rounded-lg border border-border text-text-muted hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════ REPORTS ══════════════════ -->
      <div class="relative z-10">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-text flex items-center gap-2">
            <FileText class="w-5 h-5 text-primary" />
            Generate Reports
          </h2>
          <p class="text-text-muted text-sm mt-0.5">Export structured PDF reports for this patient</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Consultation Report -->
          <div class="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 flex flex-col gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
              <BookOpen class="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 class="font-semibold text-text">Consultation Report</h3>
              <p class="text-text-muted text-sm mt-1 leading-relaxed">All consultation notes, therapist observations, and recommendations.</p>
            </div>
            <button
              id="btn-gen-consultation-report"
              @click="generateReport('Consultation Report')"
              class="mt-auto flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2.5 rounded-xl font-medium transition-all text-sm border border-primary/20 hover:border-primary"
            >
              <Download class="w-4 h-4" />
              Generate PDF
            </button>
          </div>

          <!-- Progress Report -->
          <div class="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 flex flex-col gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center">
              <TrendingUp class="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 class="font-semibold text-text">Progress Report</h3>
              <p class="text-text-muted text-sm mt-1 leading-relaxed">Stress trends, heart rate stats, and high-stress episodes over time.</p>
            </div>
            <button
              id="btn-gen-progress-report"
              @click="generateReport('Progress Report')"
              class="mt-auto flex items-center gap-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white px-4 py-2.5 rounded-xl font-medium transition-all text-sm border border-green-500/20 hover:border-green-500"
            >
              <Download class="w-4 h-4" />
              Generate PDF
            </button>
          </div>

          <!-- Full Patient Report -->
          <div class="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 flex flex-col gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
              <FileText class="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 class="font-semibold text-text">Full Patient Report</h3>
              <p class="text-text-muted text-sm mt-1 leading-relaxed">Complete patient file: info, consultations, monitoring stats, and history.</p>
            </div>
            <button
              id="btn-gen-full-report"
              @click="generateReport('Full Patient Report')"
              class="mt-auto flex items-center gap-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white px-4 py-2.5 rounded-xl font-medium transition-all text-sm border border-purple-500/20 hover:border-purple-500"
            >
              <Download class="w-4 h-4" />
              Generate PDF
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════════════════════════════ CONSULTATION MODAL ══════════════════ -->
    <Transition name="modal">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="closeModal"
      >
        <div class="bg-surface border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-hover/20">
            <div>
              <h3 class="text-lg font-semibold text-text">
                {{ editingConsultation ? 'Edit Consultation' : 'New Consultation' }}
              </h3>
              <p class="text-text-muted text-xs mt-0.5">{{ fullName }}</p>
            </div>
            <button
              @click="closeModal"
              id="btn-close-modal"
              class="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-text-muted mb-1.5">Session Summary <span class="text-red-400">*</span></label>
              <textarea
                v-model="form.summary"
                id="field-summary"
                rows="3"
                placeholder="Describe the session outcome and key points…"
                class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-text-muted mb-1.5">Observations</label>
              <textarea
                v-model="form.observations"
                id="field-observations"
                rows="3"
                placeholder="Clinical observations during the session…"
                class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-text-muted mb-1.5">Recommendations</label>
              <textarea
                v-model="form.recommendations"
                id="field-recommendations"
                rows="3"
                placeholder="Treatment plan, next steps, or follow-up actions…"
                class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-text-muted mb-1.5">Stress Assessment</label>
              <select
                v-model="form.stressAssessment"
                id="field-stress-assessment"
                class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none text-sm"
              >
                <option value="BASELINE">BASELINE — Calm / Normal</option>
                <option value="MILD_STRESS">MILD STRESS — Slightly elevated</option>
                <option value="HIGH_STRESS">HIGH STRESS — Significantly elevated</option>
              </select>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-border bg-surface-hover/20 flex justify-end gap-3">
            <button
              @click="closeModal"
              id="btn-cancel-modal"
              class="px-5 py-2.5 rounded-xl font-medium text-text hover:bg-surface-hover transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              @click="saveConsultation"
              id="btn-save-consultation"
              :disabled="saving || !form.summary.trim()"
              class="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
              {{ saving ? 'Saving…' : editingConsultation ? 'Update' : 'Save Consultation' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
