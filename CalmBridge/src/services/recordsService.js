import axios from 'axios'

const PATIENT_API = 'http://localhost:3000/students'
const API_BASE = 'http://localhost:8080/api'

/**
 * Fetch a single patient by ID
 */
export const getPatientById = (id) =>
  axios.get(`${PATIENT_API}/${id}`)

/**
 * Fetch all consultations for a patient
 */
export const getConsultations = (patientId) =>
  axios.get(`${API_BASE}/consultations/patient/${patientId}`)

/**
 * Create a new consultation
 */
export const createConsultation = (data) =>
  axios.post(`${API_BASE}/consultations`, data)

/**
 * Update an existing consultation
 */
export const updateConsultation = (id, data) =>
  axios.put(`${API_BASE}/consultations/${id}`, data)

/**
 * Delete a consultation
 */
export const deleteConsultation = (id) =>
  axios.delete(`${API_BASE}/consultations/${id}`)

/**
 * Fetch monitoring sessions for a patient
 */
export const getMonitoringSessions = (patientId) =>
  axios.get(`${API_BASE}/monitoring/patient/${patientId}/sessions`)
