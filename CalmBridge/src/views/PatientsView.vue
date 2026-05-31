<script setup>
import { ref } from 'vue'
import { Search, Plus, FolderOpen, ChevronRight, X, Edit, Trash2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { onMounted, computed } from 'vue'
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent
} from '../services/patientservice.js'
const patients = ref([])
const router = useRouter()


const fetchPatients = async () => {
  try {
    const response = await getStudents()
    patients.value = response.data
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchPatients()
})

const search = ref('')
const filteredPatients = computed(() => {
  return patients.value.filter(patient => {
    const fullName =
      `${patient.firstName} ${patient.lastName}`.toLowerCase()

    return fullName.includes(search.value.toLowerCase())
  })
})

const showAddPatientModal = ref(false)
const newPatient = ref({
  firstName: '',
  lastName: '',
  age: null,
  diagnosis: ''
})

const startSession = (id) => {
  router.push(`/session/${id}`)
}

const addNewPatient = async () => {
  try {
    await createStudent({
      studentCode: `PAT-${Date.now()}`,
      firstName: newPatient.value.firstName,
      lastName: newPatient.value.lastName,
      age: newPatient.value.age,
      diagnosis: newPatient.value.diagnosis
    })

    await fetchPatients()

    showAddPatientModal.value = false

    newPatient.value = {
      firstName: '',
      lastName: '',
      age: null,
      diagnosis: ''
    }
  } catch (error) {
    console.error(error)
  }
}
const removePatient = async (id) => {
  if (!confirm('Delete this patient?')) return

  try {
    await deleteStudent(id)
    await fetchPatients()
  } catch (error) {
    console.error(error)
  }
}
const editingPatient = ref(null)
const editPatient = (patient) => {
  editingPatient.value = { ...patient }

  newPatient.value = {
    firstName: patient.firstName,
    lastName: patient.lastName,
    age: patient.age,
    diagnosis: patient.diagnosis
  }

  showAddPatientModal.value = true
}
const savePatient = async () => {
  try {
    const payload = {
      studentCode:
        editingPatient.value?.studentCode ??
        `PAT-${Date.now()}`,

      firstName: newPatient.value.firstName,
      lastName: newPatient.value.lastName,
      age: Number(newPatient.value.age),
      diagnosis: newPatient.value.diagnosis
    }

    if (editingPatient.value) {
      await updateStudent(
        editingPatient.value.id,
        payload
      )
    } else {
      await createStudent(payload)
    }
// Close modal
    showAddPatientModal.value = false
    await fetchPatients()

    resetForm()

    showAddPatientModal.value = false

  } catch (error) {
    console.error(error)

    console.log(
      error.response?.data
    )
  }
}
const resetForm = () => {
  editingPatient.value = null

  newPatient.value = {
    firstName: '',
    lastName: '',
    age: null,
    diagnosis: ''
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
          v-model="search"
          placeholder="Search patients..." 
          class="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>
    </div>

    <!-- Patients List -->
    <div class="bg-surface border border-border rounded-2xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-surface-hover/30 border-b border-border">
          <tr            
          >
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Patient Name</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Diagnosis</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted">Last Session</th>
            <th class="px-6 py-4 text-sm font-medium text-text-muted text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="patient in filteredPatients"       :key="patient.id" class="hover:bg-surface-hover/30 transition-colors group">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {{ patient.firstName.charAt(0) }}
                </div>
                <div>
                  <p class="font-medium text-text">{{ patient.firstName }} {{ patient.lastName }}</p>
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
                <button 
                @click="editPatient(patient)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-text hover:bg-surface-hover transition-colors">
                  <Edit class="w-4 h-4" />
                  Edit
                </button>
                <button 
                @click="removePatient(patient.id)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 class="w-4 h-4" />
                  Delete
                </button>
                <button 
                  @click="router.push(`/records/${patient.id}`)"
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
          <button @click="showAddPatientModal = false ;resetForm()" 
          class="text-text-muted hover:text-primary transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1.5">First Name</label>
            <input 
              v-model="newPatient.firstName"
              type="text" 
              placeholder="e.g. John"
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
           <div>
            <label class="block text-sm font-medium text-text-muted mb-1.5">Last Name</label>
            <input 
              v-model="newPatient.lastName"
              type="text" 
              placeholder="e.g. Doe"
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
            @click="savePatient"
            class="bg-gradient-to-r from-primary to-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10"
            :disabled="
!newPatient.firstName ||
!newPatient.lastName ||
!newPatient.age ||
!newPatient.diagnosis
"
            :class="{'opacity-50 cursor-not-allowed': !newPatient.firstName || !newPatient.lastName || !newPatient.age || !newPatient.diagnosis}"
          >
            {{ editingPatient ? 'Update Patient' : 'Add Patient' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
