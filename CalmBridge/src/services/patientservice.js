import { ref } from 'vue'
import { Search, Plus, FolderOpen, ChevronRight, X, Edit, Trash2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import axios from 'axios'

const API_URL = 'http://localhost:3000/students'

export const getStudents = () => axios.get(API_URL)

export const createStudent = (data) =>
    axios.post(API_URL, data)

export const updateStudent = (id, data) =>
    axios.put(`${API_URL}/${id}`, data)

export const deleteStudent = (id) =>
    axios.delete(`${API_URL}/${id}`)