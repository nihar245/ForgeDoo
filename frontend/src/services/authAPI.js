import api from '../config/api'

export const authAPI = {
  // Register new user
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData)
    return response.data
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // Verify OTP and reset password
  verifyOTP: async (email, otp, newPassword) => {
    const response = await api.post('/auth/verify-otp', {
      email,
      otp,
      newPassword
    })
    return response.data
  }
}

export default authAPI