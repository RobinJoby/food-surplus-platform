import axios from 'axios'

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']

      // Only redirect to login if on a protected route
      const publicRoutes = ['/', '/login', '/register'];
      if (!publicRoutes.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error)
  }
)

// API functions for different endpoints
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
}

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
}

export const foodAPI = {
  create: (data) => api.post('/food', data),
  getAll: (params = {}) => api.get('/food', { params }),
  update: (id, data) => api.put(`/food/${id}`, data),
  delete: (id) => api.delete(`/food/${id}`),
}

export const pickupAPI = {
  create: (data) => api.post('/pickup', data),
  getAll: (params = {}) => api.get('/pickup', { params }),
  update: (id, data) => api.put(`/pickup/${id}`, data),
}

export const notificationAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
}

export const adminAPI = {
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getVerificationRequests: (params = {}) => api.get('/admin/verification-requests', { params }),
  updateVerificationRequest: (id, data) => api.put(`/admin/verification-requests/${id}`, data),
}

export default api
