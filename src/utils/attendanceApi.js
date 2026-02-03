import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Attendance API endpoints
export const attendanceAPI = {
  // Mark attendance for multiple students
  markAttendance: (data) => api.post('/attendance/mark', data),
  
  // Get students for attendance marking
  getStudents: (params) => api.get('/attendance/students', { params }),
  
  // Get class attendance for a specific date
  getClassAttendance: (params) => api.get('/attendance/class', { params }),
  
  // Get attendance summary
  getSummary: (params) => api.get('/attendance/summary', { params }),
  
  // Get student attendance report
  getStudentAttendance: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
  
  // Update attendance record
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),
  
  // Delete attendance record
  deleteAttendance: (id) => api.delete(`/attendance/${id}`),

  // Add custom student
  addCustomStudent: (data) => api.post('/attendance/students/add', data),
  
  // Remove custom student
  removeCustomStudent: (studentId) => api.delete(`/attendance/students/${studentId}`),

  // Get students for attendance (alias for compatibility)
  getStudentsForAttendance: (params) => api.get('/attendance/students', { params })
};

export default api;
