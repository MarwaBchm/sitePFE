import axios from 'axios'

const STUDENTS_API = 'http://localhost:3000/students'
const APPOINTMENTS_API = 'http://localhost:3000/appointments'

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

export const createStudent = (data) =>
    axios.post(
        STUDENTS_API,
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