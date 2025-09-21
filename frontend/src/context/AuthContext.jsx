import React, { createContext, useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/authAPI'

export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuthState = async () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          // First set the user data from localStorage
          setUser(userData)
          setIsAuthenticated(true)
          
          // Then verify the token is still valid
          try {
            const response = await authAPI.getProfile()
            if (response.user) {
              // Update user data with latest from server
              const updatedUser = { ...response.user, token: userData.token }
              setUser(updatedUser)
              localStorage.setItem('user', JSON.stringify(updatedUser))
            }
          } catch (error) {
            // Token verification failed - logout
            console.error('Token verification failed:', error)
            setUser(null)
            setIsAuthenticated(false)
            localStorage.removeItem('user')
          }
        } catch (error) {
          console.error('Invalid stored user data:', error)
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    // Listen for token expiration events from axios interceptor
    const handleTokenExpiration = () => {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
      toast.error('Session expired. Please login again.')
      // Navigate to login page
      window.location.href = '/login'
    }

    window.addEventListener('auth-token-expired', handleTokenExpiration)
    checkAuthState()

    // Set up periodic token validation (every 15 minutes)
    const tokenValidationInterval = setInterval(async () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser && isAuthenticated) {
        try {
          await authAPI.getProfile()
        } catch (error) {
          console.error('Periodic token validation failed:', error)
          handleTokenExpiration()
        }
      }
    }, 15 * 60 * 1000) // 15 minutes

    // Cleanup event listener and interval
    return () => {
      window.removeEventListener('auth-token-expired', handleTokenExpiration)
      clearInterval(tokenValidationInterval)
    }
  }, [isAuthenticated])

  const verifyToken = async () => {
    try {
      const response = await authAPI.getProfile()
      if (response.user) {
        const storedUser = localStorage.getItem('user')
        const currentToken = storedUser ? JSON.parse(storedUser).token : null
        const updatedUser = { ...response.user, token: currentToken }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        return true
      }
      return false
    } catch (error) {
      console.error('Token verification failed:', error)
      // Don't automatically logout here - let the caller decide
      return false
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await authAPI.login(email, password)
      
      if (response.user && response.token) {
        const userData = { ...response.user, token: response.token }
        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(userData))
        toast.success(`Welcome back, ${userData.name}!`)
        return { success: true, user: userData }
      } else {
        toast.error('Login failed - Invalid response')
        return { success: false, message: 'Invalid response format' }
      }
    } catch (error) {
      console.error('Login error:', error)
      const message = error.response?.data?.error || error.response?.data?.message || 'Login failed. Please try again.'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    try {
      setLoading(true)
      const response = await authAPI.signup(userData)
      
      if (response.user && response.token) {
        const newUser = { ...response.user, token: response.token }
        setUser(newUser)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(newUser))
        toast.success(`Account created successfully! Welcome, ${newUser.name}!`)
        return { success: true, user: newUser }
      } else {
        toast.error('Registration failed - Invalid response')
        return { success: false, message: 'Invalid response format' }
      }
    } catch (error) {
      console.error('Signup error:', error)
      const message = error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Clear local state regardless of API call result
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
      toast.success('Logged out successfully')
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email)
      if (response.message) {
        toast.success('Password reset code sent to your email')
        return { success: true, otp: response.dev?.otp } // Include OTP for development
      } else {
        toast.error('Failed to send reset code')
        return { success: false, message: 'Failed to send reset code' }
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to send reset code'
      toast.error(message)
      return { success: false, message }
    }
  }

  const verifyOTP = async (email, otp, newPassword) => {
    try {
      const response = await authAPI.verifyOTP(email, otp, newPassword)
      if (response.message) {
        toast.success('Password reset successfully')
        return { success: true }
      } else {
        toast.error('Invalid OTP or password reset failed')
        return { success: false, message: 'Invalid OTP or password reset failed' }
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      const message = error.response?.data?.error || error.response?.data?.message || 'Invalid OTP or password reset failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    verifyOTP,
    verifyToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}