import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getCurrentUser: (token) => {
    if (token) {
      // For OAuth callback - use provided token
      return api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    // Normal case - use token from localStorage (via interceptor)
    return api.get('/auth/me');
  },
};

// Leave Request API
export const leaveAPI = {
  createLeaveRequest: (data) => api.post('/leave', data),
  getMyLeaves: () => api.get('/leave/my-leaves'),
  getAllLeaves: (status) => api.get('/leave', { params: { status } }),
  getLeaveById: (id) => api.get(`/leave/${id}`),
  updateLeaveStatus: (id, data) => api.put(`/leave/${id}/status`, data),
  deleteLeaveRequest: (id) => api.delete(`/leave/${id}`),
  getLeaveStats: () => api.get('/leave/stats'),
};

// Assessment API
export const assessmentAPI = {
  getQuizForLeave: (leaveRequestId) => api.get(`/assessment/quiz/${leaveRequestId}`),
  submitQuiz: (leaveRequestId, answers) => api.post(`/assessment/quiz/${leaveRequestId}`, { answers }),
  getCodingTest: (leaveRequestId) => api.get(`/assessment/coding/${leaveRequestId}`),
  submitCodingTest: (leaveRequestId, code) => api.post(`/assessment/coding/${leaveRequestId}`, { code }),
  getAssessmentResult: (leaveRequestId) => api.get(`/assessment/result/${leaveRequestId}`),
};

// Attendance API
export const attendanceAPI = {
  getMyAttendance: () => api.get('/attendance/my-attendance'),
  getStudentAttendance: (studentId) => api.get(`/attendance/student/${studentId}`),
  updateAttendance: (studentId, data) => api.patch(`/attendance/student/${studentId}`, data),
};

// Dashboard API
export const dashboardAPI = {
  getStudentStats: () => api.get('/dashboard/student-stats'),
  getTeacherStats: () => api.get('/dashboard/teacher-stats'),
};

// Quiz API
export const quizAPI = {
  getAllQuizzes: () => api.get('/quiz'),
  getQuiz: (id) => api.get(`/quiz/${id}`),
  submitQuiz: (id, data) => api.post(`/quiz/${id}/submit`, data),
  getMyAttempts: () => api.get('/quiz/my-attempts'),
  getQuizResults: (id) => api.get(`/quiz/${id}/results`),
  // Coding execution
  executeCode: (code, language, stdin) => api.post('/quiz/execute-code', { code, language, stdin }),
  runTestCases: (code, language, testCases) => api.post('/quiz/run-tests', { code, language, testCases }),
  // Gemini AI features
  evaluateCode: (question, code, language, expectedOutput) => 
    api.post('/quiz/evaluate-code', { question, code, language, expectedOutput }),
  getHints: (question, code) => api.post('/quiz/get-hints', { question, code }),
  explainCode: (code, language) => api.post('/quiz/explain-code', { code, language }),
  // Teacher routes
  createQuiz: (data) => api.post('/quiz/create', data),
  getAllQuizzesForTeacher: () => api.get('/quiz/teacher/all'),
  updateQuiz: (id, data) => api.put(`/quiz/${id}`, data),
  deleteQuiz: (id) => api.delete(`/quiz/${id}`),
  // Teacher AI features
  generateQuestions: (topic, difficulty, numQuestions) => 
    api.post('/quiz/generate-questions', { topic, difficulty, numQuestions }),
  generateCodingQuestion: (topic, difficulty, language) => 
    api.post('/quiz/generate-coding-question', { topic, difficulty, language }),
};

export default api;
