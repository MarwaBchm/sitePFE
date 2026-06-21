import { ref, computed } from 'vue'
import { getAppointments, acceptAppointment, declineAppointment } from '../services/appointmentService'

const appointments = ref([])
const loading = ref(false)

const pendingAppointments = computed(() => {
  return appointments.value.filter(a => a.status.toLowerCase() === 'pending')
})

const pendingCount = computed(() => pendingAppointments.value.length)

const fetchAppointments = async () => {
  loading.value = true
  try {
    appointments.value = await getAppointments()
  } catch (error) {
    console.error('Failed to fetch appointments:', error)
  } finally {
    loading.value = false
  }
}

const accept = async (id, dateTime) => {
  try {
    await acceptAppointment(id, dateTime)
    const index = appointments.value.findIndex(a => a.id === id)
    if (index !== -1) {
      appointments.value[index].status = 'Scheduled'
      appointments.value[index].dateTime = dateTime
    }
  } catch (err) {
    console.error(err)
  }
}

const decline = async (id) => {
  try {
    await declineAppointment(id)
    const index = appointments.value.findIndex(a => a.id === id)
    if (index !== -1) {
      appointments.value[index].status = 'Declined'
    }
  } catch (err) {
    console.error(err)
  }
}

const addLocalRequest = (newReq) => {
  appointments.value.unshift(newReq)
}

export function useAppointmentsShared() {
  return {
    appointments,
    loading,
    pendingAppointments,
    pendingCount,
    fetchAppointments,
    accept,
    decline,
    addLocalRequest
  }
}
