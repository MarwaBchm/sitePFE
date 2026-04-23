<script setup>
import { Search, Plus, Calendar, Clock, User, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const consultations = [
  { id: 1, patientId: 1, patientName: 'Sarah Jenkins', date: '2023-10-24', time: '14:00', duration: '45m', type: 'VR Exposure Therapy', status: 'completed' },
  { id: 2, patientId: 2, patientName: 'Michael Chen', date: '2023-10-25', time: '10:30', duration: '60m', type: 'CBT Session', status: 'upcoming' },
  { id: 3, patientId: 3, patientName: 'Emma Thompson', date: '2023-10-25', time: '13:00', duration: '45m', type: 'Initial Assessment', status: 'upcoming' },
  { id: 4, patientId: 1, patientName: 'Sarah Jenkins', date: '2023-10-17', time: '14:00', duration: '50m', type: 'VR Exposure Therapy', status: 'completed' },
  { id: 5, patientId: 4, patientName: 'James Wilson', date: '2023-10-15', time: '09:00', duration: '45m', type: 'VR Exposure Therapy', status: 'completed' },
]

const startNewSession = () => {
  // Normally this would open a modal to select a patient, but for demo we just route to patient 1
  router.push(`/session/1`)
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Consultations</h1>
        <p class="text-text-muted mt-2">View past records and upcoming sessions.</p>
      </div>
      <button 
        @click="startNewSession"
        class="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
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
          type="text" 
          placeholder="Search consultations..." 
          class="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>
      <select class="bg-surface border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary">
        <option>All Status</option>
        <option>Completed</option>
        <option>Upcoming</option>
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
          <tr v-for="consult in consultations" :key="consult.id" class="hover:bg-surface-hover/30 transition-colors group">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <User class="w-4 h-4" />
                </div>
                <span class="font-medium text-white">{{ consult.patientName }}</span>
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
                <span class="w-1.5 h-1.5 rounded-full" :class="consult.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'"></span>
                {{ consult.status.charAt(0).toUpperCase() + consult.status.slice(1) }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button class="text-primary hover:text-primary-hover font-medium text-sm flex items-center justify-end w-full gap-1 transition-colors">
                View Details
                <ChevronRight class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
