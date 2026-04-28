<script setup>
import { ref } from 'vue'
import { Search, Plus, FolderOpen, ChevronRight, X, Edit, Trash2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const patients = ref([
  { id: 1, name: 'Sarah Jenkins', age: 34, diagnosis: 'Social Anxiety Disorder', lastSession: '2023-10-24', sessionsCount: 12 },
  { id: 2, name: 'Michael Chen', age: 28, diagnosis: 'Agoraphobia', lastSession: '2023-10-22', sessionsCount: 8 },
  { id: 3, name: 'Emma Thompson', age: 45, diagnosis: 'Acrophobia', lastSession: '2023-10-20', sessionsCount: 15 },
  { id: 4, name: 'James Wilson', age: 31, diagnosis: 'PTSD', lastSession: '2023-10-18', sessionsCount: 4 },
])

const showAddPatientModal = ref(false)
const newPatient = ref({ name: '', age: null, diagnosis: '' })

const startSession = (id) => {
  router.push(`/session/${id}`)
}

const addNewPatient = () => {
  if (newPatient.value.name && newPatient.value.age && newPatient.value.diagnosis) {
    patients.value.push({
      id: patients.value.length + 1,
      name: newPatient.value.name,
      age: newPatient.value.age,
      diagnosis: newPatient.value.diagnosis,
      lastSession: 'Never',
      sessionsCount: 0
    })
    showAddPatientModal.value = false
    newPatient.value = { name: '', age: null, diagnosis: '' }
  }
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-text">Patients</h1>
        <p class="text-text-muted mt-2">Manage your patients and start therapy sessions.</p>
      </div>
      <button 
        @click="showAddPatientModal = true"
        class="bg-gradient-to-r from-blue-900 via-blue-600  to-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10 hover:bg-primary"
      >
        <Plus class="w-5 h-5" />
        New Patient
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="flex gap-4">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input 
          type="text" 
          placeholder="Search patients..." 
          class="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>
    </div>

    <!-- Patients List -->
    <div class="bg-surface border border-border rounded-2xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-surface-hover/30 border-b border-border">
          <tr>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Patient Name</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Diagnosis</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Last Session</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="patient in patients" :key="patient.id" class="hover:bg-surface-hover/30 transition-colors group">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {{ patient.name.charAt(0) }}
                </div>
                <div>
                  <p class="font-medium text-text">{{ patient.name }}</p>
                  <p class="text-sm text-text-muted">{{ patient.age }} yrs</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="px-3 py-1 bg-surface-hover text-text rounded-full text-sm">
                {{ patient.diagnosis }}
              </span>
            </td>
            <td class="px-6 py-4 text-text-muted">
              {{ patient.lastSession }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-3 transition-opacity">
                <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-text hover:bg-surface-hover transition-colors">
                  <Edit class="w-4 h-4" />
                  Edit
                </button>
                <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 class="w-4 h-4" />
                  Delete
                </button>
                <button 
                  @click="router.push('/consultations')"
                  class="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <FolderOpen class="w-4 h-4" />
                  View Records
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add New Patient Modal -->
    <div v-if="showAddPatientModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div class="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 class="text-xl font-semibold text-text">Add New Patient</h3>
          <button @click="showAddPatientModal = false" class="text-text-muted hover:text-primary transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1.5">Full Name</label>
            <input 
              v-model="newPatient.name"
              type="text" 
              placeholder="e.g. John Doe"
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1.5">Age</label>
            <input 
              v-model="newPatient.age"
              type="number" 
              placeholder="e.g. 35"
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1.5">Diagnosis</label>
            <select 
              v-model="newPatient.diagnosis"
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
            >
              <option value="" disabled selected>Select diagnosis...</option>
              <option value="Social Anxiety Disorder">Social Anxiety Disorder</option>
              <option value="Agoraphobia">Agoraphobia</option>
              <option value="Acrophobia">Acrophobia</option>
              <option value="PTSD">PTSD</option>
              <option value="Generalized Anxiety">Generalized Anxiety</option>
            </select>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-border bg-surface-hover/30 flex justify-end gap-3">
          <button 
            @click="showAddPatientModal = false"
            class="px-5 py-2.5 rounded-xl font-medium text-text hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="addNewPatient"
            class="bg-gradient-to-r from-primary to-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10"
            :disabled="!newPatient.name || !newPatient.age || !newPatient.diagnosis"
            :class="{'opacity-50 cursor-not-allowed': !newPatient.name || !newPatient.age || !newPatient.diagnosis}"
          >
            Add Patient
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
