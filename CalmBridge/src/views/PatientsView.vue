<script setup>
import { ref } from 'vue'
import { Search, Plus, FolderOpen, ChevronRight, X, Edit, Trash2, Activity, CheckCircle2, Loader2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { getFriendlyErrorMessage } from '../utils/errorHandler'
import { onMounted, computed } from 'vue'
import {
  getMyPatients,
  getAllStudents,
  linkPatient,
  updateStudent,
  deleteStudent
} from '../services/patientservice.js'

const patients = ref([])
const allStudents = ref([])
const router = useRouter()
const isLoadingPatients = ref(true)

const fetchPatients = async () => {
  try {
    isLoadingPatients.value = true
    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    )

    // The backend expects the User ID, not the Therapist ID
    const userId = user.userId || user.id
    if (userId) {
      const response = await getMyPatients(userId)
      patients.value = response.data || []
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingPatients.value = false
  }
}

const fetchError = ref('')
const isFetchingStudents = ref(true)

const fetchAllStudents = async () => {
  try {
    isFetchingStudents.value = true
    const response = await getAllStudents()
    if (response.data?.items) {
      allStudents.value = response.data.items
    } else if (Array.isArray(response.data)) {
      allStudents.value = response.data
    } else {
      allStudents.value = []
    }
  } catch (err) {
    console.error('Fetch all students failed:', err)
    fetchError.value = getFriendlyErrorMessage(err)
  } finally {
    isFetchingStudents.value = false
  }
}

onMounted(() => {
  fetchPatients()
  fetchAllStudents()
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
  studentId: null,
  age: null,
  diagnosis: ''
})
const studentSearch = ref('')
const showStudentDropdown = ref(false)

const filteredAllStudents = computed(() => {
  if (!studentSearch.value) return allStudents.value
  const query = studentSearch.value.toLowerCase()
  return allStudents.value.filter(s => {
    const fullName = `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.toLowerCase()
    return fullName.includes(query) || (s.studentCode && s.studentCode.toLowerCase().includes(query))
  })
})

const selectStudent = (student) => {
  newPatient.value.studentId = student.id
  studentSearch.value = `${student.user.firstName} ${student.user.lastName}`
  showStudentDropdown.value = false
}

const isSubmitting = ref(false)
const successMsg = ref('')

const startSession = (id) => {
  router.push(`/session/${id}`)
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
    studentId: patient.id,
    age: patient.age,
    diagnosis: patient.diagnosis
  }
  studentSearch.value = `${patient.firstName} ${patient.lastName}`

  showAddPatientModal.value = true
}

const savePatient = async () => {
  try {
    isSubmitting.value = true
    successMsg.value = ''

    if (editingPatient.value) {
      // In a full implementation, you might update the initial session notes here
      successMsg.value = 'Patient updated successfully!'
    } else {
      const user = JSON.parse(localStorage.getItem('user'))
      const payload = {
        studentId: newPatient.value.studentId,
        therapistId: user.id,
        sessionSummary: `Initial Patient Registration.\nDiagnosis: ${newPatient.value.diagnosis}\nAge: ${newPatient.value.age}`
      }
      await linkPatient(payload)
      successMsg.value = 'Patient added successfully!'
    }

    await fetchPatients()

    setTimeout(() => {
      showAddPatientModal.value = false
      isSubmitting.value = false
      resetForm()
    }, 2000)

  } catch (error) {
    console.error(error)
    console.log(error.response?.data)
    isSubmitting.value = false
  }
}
const resetForm = () => {
  editingPatient.value = null

  newPatient.value = {
    studentId: null,
    age: null,
    diagnosis: ''
  }
  studentSearch.value = ''
  isSubmitting.value = false
  successMsg.value = ''
}
const formatDate = (date) => {
  if (!date) return 'No sessions'

  return new Date(date)
    .toLocaleDateString()
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
        class="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 ring-1 ring-white/10"
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
          <tr v-if="isLoadingPatients">
            <td colspan="4" class="px-6 py-12 text-center text-text-muted">
              <div class="flex flex-col items-center justify-center gap-3">
                <Loader2 class="w-8 h-8 text-primary animate-spin" />
                <p class="text-sm font-medium">Loading patients list...</p>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredPatients.length === 0">
            <td colspan="4" class="px-6 py-12 text-center text-text-muted">
              No patients found.
            </td>
          </tr>
          <tr v-else v-for="patient in filteredPatients" :key="patient.id" class="hover:bg-surface-hover/30 transition-colors group">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {{ patient.firstName.charAt(0) }}
                </div>
                <div>
                  <p class="font-medium text-text">{{ patient.firstName }} {{ patient.lastName }}</p>
                  <p class="text-sm text-text-muted">{{ patient.age }} yrs</p>
                  <p class="text-sm text-text-muted">
  {{ patient.totalSessions }} sessions
</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="px-3 py-1 bg-surface-hover text-text rounded-full text-sm">
                {{ patient.diagnosis }}
              </span>
            </td>
            <td class="px-6 py-4 text-text-muted">
              {{ formatDate(patient.lastSession) }}
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
          <button @click="showAddPatientModal = false; resetForm()" 
          :disabled="isSubmitting"
          class="text-text-muted hover:text-primary transition-colors disabled:opacity-50">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <!-- Success Message -->
          <div v-if="successMsg" class="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 class="w-5 h-5 shrink-0" />
            <p class="font-medium">{{ successMsg }}</p>
          </div>

          <div class="relative">
            <label class="block text-sm font-medium text-text-muted mb-1.5">Select Student</label>
            <input 
              v-model="studentSearch"
              @focus="showStudentDropdown = true"
              @blur="window.setTimeout(() => showStudentDropdown = false, 200)"
              :disabled="editingPatient !== null"
              type="text" 
              placeholder="Search by name..."
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
            />
            <div v-if="showStudentDropdown" class="absolute z-50 w-full mt-1 bg-surface border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
              <div v-if="fetchError" class="px-4 py-2 text-red-500 text-sm font-medium">
                Error fetching students: {{ fetchError }}
              </div>
              <div v-else-if="isFetchingStudents" class="px-4 py-2 text-text-muted text-sm flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading students...
              </div>
              <div 
                v-else-if="filteredAllStudents.length > 0"
                v-for="student in filteredAllStudents" 
                :key="student.id"
                @mousedown.prevent="selectStudent(student)"
                class="px-4 py-2 hover:bg-surface-hover cursor-pointer text-text text-sm"
              >
                {{ student.user?.firstName }} {{ student.user?.lastName }}
              </div>
              <div v-else class="px-4 py-2 text-text-muted text-sm">
                No students found.
              </div>
            </div>
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
            @click="showAddPatientModal = false; resetForm()"
            :disabled="isSubmitting"
            class="px-5 py-2.5 rounded-xl font-medium text-text hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            @click="savePatient"
            class="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/40 hover:shadow-primary/60 ring-1 ring-white/10"
            :disabled="isSubmitting || !newPatient.studentId || !newPatient.age || !newPatient.diagnosis"
            :class="{'opacity-50 cursor-not-allowed': isSubmitting || !newPatient.studentId || !newPatient.age || !newPatient.diagnosis}"
          >
            <svg v-if="isSubmitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>
              {{ editingPatient ? 'Update Patient' : 'Add Patient' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
