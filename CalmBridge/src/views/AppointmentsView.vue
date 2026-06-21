<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Calendar, Check, X, Clock, Plus, Search, Filter, 
  Loader2, User, Mail, FileText, ArrowRight, CheckCircle2, AlertCircle 
} from 'lucide-vue-next'
import { getMyPatients } from '../services/patientservice.js'
import { createAppointmentRequest } from '../services/appointmentService.js'
import { useAppointmentsShared } from '../composables/useAppointments.js'

// ─── Shared State ────────────────────────────────────────────────────────────
const { 
  appointments, 
  loading, 
  fetchAppointments, 
  accept, 
  decline, 
  addLocalRequest 
} = useAppointmentsShared()

// ─── Local State ─────────────────────────────────────────────────────────────
const patients = ref([])
const activeTab = ref('pending') // 'pending' | 'scheduled' | 'declined'
const searchQuery = ref('')
const selectedTypeFilter = ref('All')

// ─── Modals ──────────────────────────────────────────────────────────────────
const showScheduleModal = ref(false)
const showDeclineModal = ref(false)
const showCreateModal = ref(false)
const selectedRequest = ref(null)

// Form states
const scheduleDate = ref('')
const scheduleTime = ref('')
const declineReason = ref('')

const createForm = ref({
  patientId: '',
  type: 'VR Exposure Therapy',
  notes: '',
})

// ─── Options ─────────────────────────────────────────────────────────────────
const therapyTypes = [
  'VR Exposure Therapy',
  'Cognitive Behavioral Therapy',
  'Biofeedback Training',
  'General Consultation',
  'Relaxation & Mindfulness'
]

// ─── Data Loading ────────────────────────────────────────────────────────────
async function loadData() {
  try {
    const [_, patsRes] = await Promise.allSettled([
      fetchAppointments(),
      getMyPatients()
    ])
    
    if (patsRes.status === 'fulfilled') {
      patients.value = patsRes.value.data?.items || patsRes.value.data || []
    }
  } catch (error) {
    console.error('Error loading appointments data:', error)
  }
}

onMounted(loadData)

// ─── Computed Filters ────────────────────────────────────────────────────────
const filteredAppointments = computed(() => {
  return appointments.value.filter(app => {
    // Tab Filter
    const tabMatch = app.status.toLowerCase() === (
      activeTab.value === 'scheduled' ? 'scheduled' : 
      activeTab.value === 'declined' ? 'declined' : 'pending'
    )
    if (!tabMatch) return false

    // Search query
    const patientName =
`${app.student?.firstName || ''} ${app.student?.lastName || ''}`
    const searchMatch = searchQuery.value === '' || patientName.includes(searchQuery.value.toLowerCase())
    if (!searchMatch) return false

    // Therapy Type Filter
    const typeMatch = selectedTypeFilter.value === 'All' || app.type === selectedTypeFilter.value
    return typeMatch
  })
})

// Tab counters
const counts = computed(() => {
  return {
    pending: appointments.value.filter(a => a.status.toLowerCase() === 'pending').length,
    scheduled: appointments.value.filter(a => a.status.toLowerCase() === 'scheduled').length,
    declined: appointments.value.filter(a => a.status.toLowerCase() === 'declined').length
  }
})

// Helper to resolve student display info
function getPatientFullName(app) {
  if (!app.student) return 'Unknown Patient'
  return `${app.student.firstName} ${app.student.lastName}`
}

// ─── Action Handlers ──────────────────────────────────────────────────────────
function openSchedule(request) {
  selectedRequest.value = request
  // Set default scheduled time to 2 days from now at 10:00 AM
  const future = new Date()
  future.setDate(future.getDate() + 2)
  scheduleDate.value = future.toISOString().split('T')[0]
  scheduleTime.value = '10:00'
  showScheduleModal.value = true
}

async function handleAccept() {
  if (!selectedRequest.value || !scheduleDate.value || !scheduleTime.value) return
  
  const combinedDateTime = new Date(`${scheduleDate.value}T${scheduleTime.value}`).toISOString()
  
  try {
    await accept(selectedRequest.value.id, combinedDateTime)
    closeModals()
  } catch (error) {
    console.error('Failed to accept appointment:', error)
  }
}

function openDecline(request) {
  selectedRequest.value = request
  declineReason.value = ''
  showDeclineModal.value = true
}

async function handleDecline() {
  if (!selectedRequest.value) return
  
  try {
    await decline(selectedRequest.value.id)
    closeModals()
  } catch (error) {
    console.error('Failed to decline appointment:', error)
  }
}

async function handleCreateRequest() {
  if (!createForm.value.patientId) return
  
  const selectedPat = patients.value.find(p => p.id === parseInt(createForm.value.patientId))
  if (!selectedPat) return

  const payload = {
    studentId: selectedPat.id,
    student: selectedPat,
    type: createForm.value.type,
    notes: createForm.value.notes,
  }

  try {
    const newReq = await createAppointmentRequest(payload)
    addLocalRequest(newReq)
    createForm.value = { patientId: '', type: 'VR Exposure Therapy', notes: '' }
    showCreateModal.value = false
    activeTab.value = 'pending'
  } catch (error) {
    console.error('Failed to create request:', error)
  }
}

function closeModals() {
  showScheduleModal.value = false
  showDeclineModal.value = false
  showCreateModal.value = false
  selectedRequest.value = null
}

// ─── Formatters ──────────────────────────────────────────────────────────────
function formatDate(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
    <!-- Decorative background glow blobs -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/8 blur-[120px] pointer-events-none z-0"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/8 blur-[120px] pointer-events-none z-0"></div>

    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-text">Appointment Requests</h1>
        <p class="text-text-muted mt-2">Manage incoming patient requests, scheduling, and consultations.</p>
      </div>
      
      <button 
        @click="showCreateModal = true"
        class="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 ring-1 ring-white/10"
      >
        <Plus class="w-5 h-5" />
        New Session Request
      </button>
    </div>

    <!-- Stats summary bar -->
    <div class="relative z-10 grid grid-cols-3 gap-6 bg-surface/40 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-md">
      <div class="text-center md:text-left md:pl-6 border-r border-border">
        <p class="text-text-muted text-xs md:text-sm font-medium uppercase tracking-wider">Pending Requests</p>
        <p class="text-2xl md:text-3xl font-bold text-yellow-500 mt-2">{{ counts.pending }}</p>
      </div>
      <div class="text-center md:text-left md:pl-6 border-r border-border">
        <p class="text-text-muted text-xs md:text-sm font-medium uppercase tracking-wider">Scheduled Sessions</p>
        <p class="text-2xl md:text-3xl font-bold text-primary mt-2">{{ counts.scheduled }}</p>
      </div>
      <div class="text-center md:text-left md:pl-6">
        <p class="text-text-muted text-xs md:text-sm font-medium uppercase tracking-wider">Declined Requests</p>
        <p class="text-2xl md:text-3xl font-bold text-text-muted mt-2">{{ counts.declined }}</p>
      </div>
    </div>

    <!-- Main Section -->
    <div class="relative z-10 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
      <!-- Toolbar & Filters -->
      <div class="p-6 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <!-- Tabs -->
        <div class="flex bg-background border border-border rounded-xl p-1 shrink-0 self-start">
          <button 
            v-for="tab in [
              { id: 'pending', label: 'Pending Requests', count: counts.pending, color: 'text-yellow-500 bg-yellow-500/10' },
              { id: 'scheduled', label: 'Scheduled', count: counts.scheduled, color: 'text-primary bg-primary/10' },
              { id: 'declined', label: 'Declined', count: counts.declined, color: 'text-text-muted bg-border' }
            ]"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            :class="activeTab === tab.id ? 'bg-surface text-text shadow-sm border border-border' : 'text-text-muted hover:text-text'"
          >
            {{ tab.label }}
            <span class="text-xs px-2 py-0.5 rounded-full font-bold" :class="tab.color">
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- Search and filters -->
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-xl">
          <div class="relative w-full">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search patient name..."
              class="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div class="relative w-full sm:w-60">
            <Filter class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select 
              v-model="selectedTypeFilter"
              class="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
            >
              <option value="All">All Therapy Types</option>
              <option v-for="type in therapyTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Content Lists -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 class="w-10 h-10 text-primary animate-spin" />
        <p class="text-text-muted text-sm">Loading appointment requests...</p>
      </div>

      <div v-else-if="filteredAppointments.length === 0" class="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div class="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center border border-border text-text-muted">
          <Calendar class="w-8 h-8 opacity-60" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-text">No appointments found</h3>
          <p class="text-text-muted text-sm mt-1 max-w-xs mx-auto">There are no requests matching your search filters in this section.</p>
        </div>
      </div>

      <div v-else class="divide-y divide-border">
        <div 
          v-for="app in filteredAppointments" 
          :key="app.id"
          class="p-6 hover:bg-surface-hover/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <!-- Left: Patient Info & Type -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <User class="w-6 h-6" />
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-2.5 flex-wrap">
                <h3 class="text-lg font-semibold text-text hover:text-primary transition-colors cursor-pointer">
                  {{ getPatientFullName(app) }}
                </h3>
                <span class="text-xs px-2.5 py-0.5 rounded-full font-medium bg-border text-text-muted">
                  {{ app.student?.department || 'Department' }}
                </span>
                <span 
                  v-if="app.status === 'Scheduled'" 
                  class="text-xs px-2.5 py-0.5 rounded-full font-medium bg-green-500/10 text-green-400 border border-green-500/20"
                >
                  Scheduled
                </span>
                <span 
                  v-else-if="app.status === 'Declined'" 
                  class="text-xs px-2.5 py-0.5 rounded-full font-medium bg-red-500/10 text-red-400 border border-red-500/20"
                >
                  Declined
                </span>
              </div>
              <p class="text-sm text-primary font-medium">{{ app.type }}</p>
              <div class="flex items-center gap-4 text-xs text-text-muted pt-1">
                <span class="flex items-center gap-1.5">
                  <Mail class="w-3.5 h-3.5" />
                  {{ app.student?.email || 'No email' }}
                </span>
                <span class="flex items-center gap-1.5">
                  <Clock class="w-3.5 h-3.5" />
                  Requested {{ formatDate(app.createdAt) }}
                </span>
              </div>
              
              <!-- Patient note -->
              <div v-if="app.notes" class="mt-3 bg-background border border-border rounded-xl p-3 flex items-start gap-2 max-w-2xl">
                <FileText class="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                <p class="text-xs text-text-muted italic leading-relaxed">{{ app.notes }}</p>
              </div>
            </div>
          </div>

          <!-- Right: Scheduled Details / Action Buttons -->
          <div class="flex items-center gap-3 self-end md:self-center">
            <!-- Scheduled Date/Time Display -->
            <div v-if="app.status === 'SCHEDULED'" class="bg-primary/5 border border-primary/20 rounded-xl p-3 text-right">
              <p class="text-xs text-text-muted uppercase font-medium tracking-wider">Scheduled Date</p>
              <p class="text-sm font-semibold text-text mt-1 flex items-center gap-1.5 justify-end">
                <Calendar class="w-4 h-4 text-primary" />
                {{ formatDate(app.dateTime) }}
              </p>
              <p class="text-xs text-text-muted mt-0.5 flex items-center gap-1.5 justify-end">
                <Clock class="w-3.5 h-3.5 text-primary" />
                {{ formatTime(app.dateTime) }}
              </p>
            </div>

            <!-- Declined Status Details -->
            <div v-else-if="app.status === 'DECLINED'" class="text-right flex items-center gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
              <AlertCircle class="w-5 h-5 text-red-400" />
              <div>
                <p class="text-xs text-red-400 font-medium">Declined Request</p>
                <p class="text-xxs text-text-muted mt-0.5">Archived</p>
              </div>
            </div>

            <!-- Action buttons for Pending -->
            <template v-else>
              <button 
                @click="openDecline(app)"
                class="flex items-center gap-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4.5 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                <X class="w-4 h-4" />
                Decline
              </button>
              <button 
                @click="openSchedule(app)"
                class="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
              >
                <Check class="w-4 h-4" />
                Accept & Schedule
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════ MODAL: SCHEDULE ═══════════════════ -->
    <div v-if="showScheduleModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals"></div>
      
      <div class="bg-surface border border-border rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-border flex items-center justify-between">
          <h2 class="text-xl font-bold text-text flex items-center gap-2">
            <Calendar class="w-5.5 h-5.5 text-primary" />
            Schedule Appointment
          </h2>
          <button @click="closeModals" class="p-1 hover:bg-surface-hover rounded-lg text-text-muted transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleAccept" class="p-6 space-y-5">
          <div class="bg-background border border-border rounded-2xl p-4 flex items-start gap-3">
            <User class="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-text-muted font-medium">Patient</p>
              <p class="text-sm font-bold text-text mt-0.5">{{ selectedRequest ? getPatientFullName(selectedRequest) : '' }}</p>
              <p class="text-xs text-primary font-medium mt-1">{{ selectedRequest?.type }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Appointment Date</label>
              <input 
                v-model="scheduleDate"
                type="date"
                required
                class="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Time Slot</label>
              <input 
                v-model="scheduleTime"
                type="time"
                required
                class="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              />
            </div>
          </div>

          <div class="pt-4 border-t border-border flex gap-3">
            <button 
              type="button" 
              @click="closeModals"
              class="flex-1 bg-surface border border-border hover:border-primary/50 text-text px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="flex-1 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-primary/25 transition-all"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════ MODAL: DECLINE CONFIRMATION ═══════ -->
    <div v-if="showDeclineModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals"></div>
      
      <div class="bg-surface border border-border rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-border flex items-center justify-between">
          <h2 class="text-xl font-bold text-text flex items-center gap-2">
            <X class="w-5.5 h-5.5 text-red-500" />
            Decline Request
          </h2>
          <button @click="closeModals" class="p-1 hover:bg-surface-hover rounded-lg text-text-muted transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleDecline" class="p-6 space-y-5">
          <div class="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle class="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <p class="text-sm text-text-muted leading-relaxed">
              Are you sure you want to decline the session request for 
              <strong class="text-text">{{ selectedRequest ? getPatientFullName(selectedRequest) : '' }}</strong>? This will archive the request.
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Optional Reason / Notes</label>
            <textarea 
              v-model="declineReason"
              placeholder="e.g. Schedule conflicts, referral needed..."
              rows="3"
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
            ></textarea>
          </div>

          <div class="pt-4 border-t border-border flex gap-3">
            <button 
              type="button" 
              @click="closeModals"
              class="flex-1 bg-surface border border-border hover:border-primary/50 text-text px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="flex-1 bg-red-500 text-white hover:bg-red-600 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-red-500/20"
            >
              Decline Request
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════ MODAL: CREATE REQUEST ════════════ -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals"></div>
      
      <div class="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-border flex items-center justify-between">
          <h2 class="text-xl font-bold text-text flex items-center gap-2">
            <Plus class="w-5.5 h-5.5 text-primary" />
            Create Session Request
          </h2>
          <button @click="closeModals" class="p-1 hover:bg-surface-hover rounded-lg text-text-muted transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleCreateRequest" class="p-6 space-y-5">
          <!-- Select Patient -->
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Select Patient</label>
            <select 
              v-model="createForm.patientId"
              required
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
            >
              <option value="" disabled>Choose a patient...</option>
              <option v-for="pat in patients" :key="pat.id" :value="pat.id">
                {{ pat.firstName }} {{ pat.lastName }} (Code: {{ pat.studentCode }})
              </option>
            </select>
          </div>

          <!-- Select Therapy Type -->
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Therapy Type</label>
            <select 
              v-model="createForm.type"
              required
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
            >
              <option v-for="type in therapyTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Session Notes / Reasons</label>
            <textarea 
              v-model="createForm.notes"
              placeholder="e.g. Schedule VR exposure session for height fear. Patient requests early morning slot."
              rows="4"
              required
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
            ></textarea>
          </div>

          <div class="pt-4 border-t border-border flex gap-3">
            <button 
              type="button" 
              @click="closeModals"
              class="flex-1 bg-surface border border-border hover:border-primary/50 text-text px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="flex-1 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-primary/25 transition-all"
            >
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Small additional styling */
.text-xxs {
  font-size: 0.65rem;
}
</style>
