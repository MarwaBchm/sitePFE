import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const STUDENTS_API = `${API_URL}/students`
const APPOINTMENTS_API = `${API_URL}/appointments`

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
})

export const getMyPatients = (userId) =>
    axios.get(
        `${APPOINTMENTS_API}/my-patients/${userId}`,
        getAuthConfig()
    )

export const getAllStudents = () =>
    axios.get(
        `${STUDENTS_API}?limit=1000`,
        getAuthConfig()
    )

export const linkPatient = (data) =>
    axios.post(
        `${APPOINTMENTS_API}/session`,
        data,
        getAuthConfig()
    )

export const updateStudent = (id, data) =>
    axios.patch(
        `${STUDENTS_API}/${id}`,
        data,
        getAuthConfig()
    )

export const deleteStudent = (id) =>
    axios.delete(
        `${STUDENTS_API}/${id}`,
        getAuthConfig()
    )