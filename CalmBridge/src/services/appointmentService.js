import axios from 'axios'

const API_BASE = 'http://localhost:3000/appointments'

export const getAppointments = async () => {
  const res = await axios.get(API_BASE)
  return res.data
}

export const acceptAppointment = async (id, dateTime) => {
  const res = await axios.patch(
    `${API_BASE}/${id}/accept`,
    { dateTime }
  )

  return res.data
}

export const declineAppointment = async (id) => {
  const res = await axios.patch(
    `${API_BASE}/${id}/decline`
  )

  return res.data
}

export const createAppointmentRequest = async (data) => {
  const res = await axios.post(
    `${API_BASE}/request`,
    data
  )

  return res.data
}

export const deleteAppointment = async (id) => {
  const res = await axios.delete(
    `${API_BASE}/${id}`
  )

  return res.data
}