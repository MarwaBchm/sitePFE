<script setup>
import { Search, Plus, Calendar, Clock, User, ChevronRight, Activity, X } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'

const router = useRouter()

const showNewSessionModal = ref(false)
const selectedPatientId = ref('')
const newSessionType = ref('VR Exposure Therapy')

const patients = [
  { id: 1, name: 'Sarah Jenkins' },
  { id: 2, name: 'Michael Chen' },
  { id: 3, name: 'Emma Thompson' },
  { id: 4, name: 'James Wilson' }
]

const consultations = ref([
  { id: 1, patientId: 1, patientName: 'Sarah Jenkins', date: '2023-10-24', time: '14:00', duration: '45m', type: 'VR Exposure Therapy', status: 'completed' },
  { id: 6, patientId: 1, patientName: 'Sarah Jenkins', date: '2023-10-17', time: '14:00', duration: '50m', type: 'VR Exposure Therapy', status: 'completed' },
  { id: 7, patientId: 1, patientName: 'Sarah Jenkins', date: '2023-10-10', time: '14:00', duration: '45m', type: 'VR Exposure Therapy', status: 'completed' },
  { id: 2, patientId: 2, patientName: 'Michael Chen', date: '2023-10-25', time: '10:30', duration: 'Ongoing', type: 'CBT Session', status: 'ongoing' },
  { id: 8, patientId: 2, patientName: 'Michael Chen', date: '2023-10-18', time: '10:30', duration: '60m', type: 'CBT Session', status: 'completed' },
  { id: 3, patientId: 3, patientName: 'Emma Thompson', date: '2023-10-25', time: '13:00', duration: 'Ongoing', type: 'Initial Assessment', status: 'ongoing' },
  { id: 5, patientId: 4, patientName: 'James Wilson', date: '2023-10-15', time: '09:00', duration: '45m', type: 'VR Exposure Therapy', status: 'completed' },
])

const searchQuery = ref('')
const filterType = ref('All Types')
const filterStatus = ref('All Status')

const filteredConsultations = computed(() => {
  return consultations.value.filter(c => {
    const matchSearch = c.patientName.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchType = filterType.value === 'All Types' ? true : c.type === filterType.value
    const matchStatus = filterStatus.value === 'All Status' ? true : c.status === filterStatus.value.toLowerCase()
    return matchSearch && matchType && matchStatus
  })
})

const startNewSession = () => {
  if (selectedPatientId.value) {
    showNewSessionModal.value = false
    router.push(`/session/${selectedPatientId.value}`)
  }
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-text">Consultations</h1>
        <p class="text-text-muted mt-2">View past records and upcoming sessions.</p>
      </div>
      <button 
        @click="showNewSessionModal = true"
        class="bg-gradient-to-r from-primary to-primary-hover text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10"
      >
        <Plus class="w-5 h-5" />
        Start New Consultation
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="flex gap-4">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by patient name..." 
          class="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>
      <select v-model="filterType" class="bg-surface border border-border rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary">
        <option>All Types</option>
        <option>VR Exposure Therapy</option>
        <option>CBT Session</option>
        <option>Initial Assessment</option>
      </select>
      <select v-model="filterStatus" class="bg-surface border border-border rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary">
        <option>All Status</option>
        <option>Completed</option>
        <option>Ongoing</option>
      </select>
    </div>

    <!-- Consultations List -->
    <div class="bg-surface border border-border rounded-2xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-surface-hover/30 border-b border-border">
          <tr>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Patient</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Date & Time</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Type</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Status</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="consult in filteredConsultations" :key="consult.id" class="hover:bg-surface-hover/30 transition-colors group">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <User class="w-4 h-4" />
                </div>
                <span class="font-medium text-text">{{ consult.patientName }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-4 text-text-muted">
                <div class="flex items-center gap-1.5">
                  <Calendar class="w-4 h-4" />
                  <span>{{ consult.date }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <Clock class="w-4 h-4" />
                  <span>{{ consult.time }} ({{ consult.duration }})</span>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-text-muted">
              {{ consult.type }}
            </td>
            <td class="px-6 py-4">
              <span 
                class="px-3 py-1 rounded-full text-sm flex items-center gap-1.5 w-max"
                :class="consult.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="consult.status === 'completed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'"></span>
                {{ consult.status.charAt(0).toUpperCase() + consult.status.slice(1) }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button 
                v-if="consult.status === 'completed'"
                @click="router.push(`/consultation/${consult.id}`)"
                class="text-primary hover:text-primary-hover font-medium text-sm flex items-center justify-end w-full gap-1 transition-colors"
              >
                View Details
                <ChevronRight class="w-4 h-4" />
              </button>
              <button 
                v-else
                @click="router.push(`/session/${consult.id}`)"
                class="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ml-auto"
              >
                <Activity class="w-4 h-4" />
                Monitor Session
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Start New Consultation Modal -->
    <div v-if="showNewSessionModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div class="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 class="text-xl font-semibold text-text">Start New Consultation</h3>
          <button @click="showNewSessionModal = false" class="text-text-muted hover:text-primary transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1.5">Select Patient</label>
            <select 
              v-model="selectedPatientId"
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            >
              <option value="" disabled>Choose a patient...</option>
              <option v-for="patient in patients" :key="patient.id" :value="patient.id">{{ patient.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1.5">Consultation Type</label>
            <select 
              v-model="newSessionType"
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            >
              <option>VR Exposure Therapy</option>
              <option>CBT Session</option>
              <option>Initial Assessment</option>
            </select>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-border bg-surface-hover/30 flex justify-end gap-3">
          <button 
            @click="showNewSessionModal = false"
            class="px-5 py-2.5 rounded-xl font-medium text-text hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="startNewSession"
            class="bg-gradient-to-r from-primary to-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10"
            :disabled="!selectedPatientId"
            :class="{'opacity-50 cursor-not-allowed': !selectedPatientId}"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
