import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const getPatientById = id =>
  api.get(`/students/${id}`)

export const getPatientSessions = patientId =>
  api.get(`/appointments/patient/${patientId}`)

export const createSession = data =>
  api.post(`/appointments/session`, data)

export const updateSession = (id, data) =>
  api.patch(`/appointments/session/${id}`, data)

export const deleteSession = id =>
  api.delete(`/appointments/session/${id}`)