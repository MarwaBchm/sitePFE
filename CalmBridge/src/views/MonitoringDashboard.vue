<script setup>
import {
  Search,
  Plus,
  User,
  Activity,
  X
} from 'lucide-vue-next'

import { useRouter } from 'vue-router'

import {
  ref,
  computed,
  onMounted,
  watch
} from 'vue'

import {
  useRealtimeData
} from '../composables/useRealtimeData'

const router = useRouter()

const showNewSessionModal = ref(false)

const selectedExamRoom = ref('')

const studentsMonitoring = ref([])

const loading = ref(true)

const {
  realtimeStudents
} = useRealtimeData()

// ======================================
// FETCH STUDENTS
// ======================================

onMounted(async () => {

  try {

    const res = await fetch(
      'https://calmebridgeback.onrender.com/students'
    )

    studentsMonitoring.value =
      await res.json()

  } catch (error) {

    console.error(error)

  } finally {

    loading.value = false
  }
})

// ======================================
// REALTIME UPDATES
// ======================================

watch(

  realtimeStudents,

  (newRealtime) => {

    Object.entries(
      newRealtime
    ).forEach(

      ([deviceId, data]) => {

        const student =
          studentsMonitoring.value.find(

            s =>
              s.deviceId === deviceId
          )

        if (student) {

          student.heartRate =
            data.heartRate

          student.stressLevel =
            data.stressLevel

          student.connected =
            data.connected

          console.log(
            'UPDATED STUDENT:',
            student
          )
        }
      }
    )
  },

  { deep: true }
)

// ======================================
// FILTERS
// ======================================

const searchQuery = ref('')

const filterStress =
  ref('All Levels')

const filterConnection =
  ref('All Connections')

// ======================================
// START SESSION
// ======================================

const startMonitoring = () => {

  showNewSessionModal.value = false

  router.push('/monitoring')
}

// ======================================
// FILTERED STUDENTS
// ======================================

const filteredStudents = computed(() => {

  return studentsMonitoring.value

    .map(student => {

      const realtime =
  realtimeStudents.value.find(

    s =>
      s.deviceId ===
      student.deviceId
  )

      // Create merged reactive object
      return {

        ...student,

        heartRate:
          realtime?.heartRate ??
          student.heartRate,

        stressLevel:
          realtime?.stressLevel ??
          student.stressLevel,

        connected:
          realtime?.connected ??
          student.connected,
      }
    })

    .filter(student => {

      const fullName =
        `${student.firstName} ${student.lastName}`

      const matchSearch =
        fullName
          .toLowerCase()
          .includes(
            searchQuery.value.toLowerCase()
          )

      const matchStress =
        filterStress.value ===
        'All Levels'
          ? true
          : student.stressLevel ===
            filterStress.value

      const matchConnection =
        filterConnection.value ===
        'All Connections'
          ? true
          : filterConnection.value ===
            'Connected'
            ? student.connected
            : !student.connected

      return (

        matchSearch &&

        matchStress &&

        matchConnection
      )
    })
    .sort((a, b) => {
      // Connected first
      return Number(b.connected) - Number(a.connected)
    })
})
</script>
<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-text"> Monitoring Dashboard</h1>
        <p class="text-text-muted mt-2">Realtime Patients stress monitoring during exams</p>
      </div>
      <button 
        @click="showNewSessionModal = true"
        class="bg-gradient-to-r from-primary to-primary-hover text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10"
      >
        <Plus class="w-5 h-5" />
        Start Monitoring Session
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
      <select v-model="filterStress" class="bg-surface border border-border rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary">
        <option>All Levels</option>
        <option>BASELINE</option>
        <option>MILD_STRESS</option>
        <option>HIGH_STRESS</option>
      </select>
      <select v-model="filterConnection" class="bg-surface border border-border rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary">
        <option>All Connections</option>
        <option>Connected</option>
        <option>Disconnected</option>
      </select>
    </div>

    <!-- Consultations List -->
    <div class="bg-surface border border-border rounded-2xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-surface-hover/30 border-b border-border">
          <tr>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Patient</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Device</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Heart Rate</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Stress Level</th>

          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for='student in filteredStudents' :key="student.id" class="hover:bg-surface-hover/30 transition-colors group">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <User class="w-4 h-4" />
                </div>
                <span class="font-medium text-text">{{ student.firstName }} {{ student.lastName }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              {{ student.deviceId }}
            </td>
            <td class="px-6 py-4 text-text-muted">
              {{ student.heartRate }} BPM
            </td>
            <td class="px-6 py-4">
              <span
                v-if="!student.connected"
                class="bg-gray-500/10 text-gray-400 px-3 py-1 rounded-full text-sm"
              >
                OFFLINE
              </span>
              <span
                v-else
                class="px-3 py-1 rounded-full text-sm flex items-center gap-1.5 w-max"
                :class="{
                'bg-green-500/10 text-green-500':
                  student.stressLevel === 'BASELINE',

                'bg-yellow-500/10 text-yellow-500':
                  student.stressLevel === 'MILD_STRESS',

                'bg-red-500/10 text-red-500 animate-pulse':
                  student.stressLevel === 'HIGH_STRESS'
              }"
              >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="{
                  'bg-green-500':
                    student.stressLevel === 'NORMAL',

                  'bg-yellow-500':
                    student.stressLevel === 'ELEVATED',

                  'bg-orange-500':
                    student.stressLevel === 'HIGH',

                  'bg-red-500 animate-pulse':
                    student.stressLevel === 'CRITICAL',

                  'bg-gray-400':
                    student.stressLevel === 'OFFLINE'
                }"
              ></span>

            {{ student.stressLevel }}
       </span>
            </td>
            <td class="px-6 py-4 text-right">
        <button
          @click="router.push(`/Consultation/${student.id}`)"
          class="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ml-auto"
        >
          <Activity class="w-4 h-4" />
          View Analytics
        </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Start New Monitoring Session Modal -->
    <div v-if="showNewSessionModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div class="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 class="text-xl font-semibold text-text">Start New Monitoring Session</h3>
          <button @click="showNewSessionModal = false" class="text-text-muted hover:text-primary transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
              <label class="block text-sm font-medium text-text-muted mb-1.5">
                Exam Name
              </label>

              <input
                type="text"
                placeholder="Enter exam name..."
                class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          <div>
              <label class="block text-sm font-medium text-text-muted mb-1.5">
                Exam Room
              </label>

              <select
                v-model="selectedExamRoom"
                class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="" disabled>Select room...</option>

                <option>Room A</option>
                <option>Room B</option>
                <option>Room C</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text-muted mb-1.5">
                Monitoring Duration
              </label>

              <select
                class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                <option>1 Hour</option>
                <option>2 Hours</option>
                <option>3 Hours</option>
                <option>Custom</option>
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
            @click="startMonitoring"
            class="bg-gradient-to-r from-primary to-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10"
            :disabled="!selectedExamRoom"
            :class="{'opacity-50 cursor-not-allowed': !selectedExamRoom}"
          >
            Start Monitoring
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
