import React, { createContext, useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'

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
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Simulate API call
      const mockUsers = [
        { id: 1, email: 'admin@erp.com', password: 'admin123', role: 'admin', name: 'Admin User' },
        { id: 2, email: 'manager@erp.com', password: 'manager123', role: 'manager', name: 'Manager User' },
        { id: 3, email: 'inventory@erp.com', password: 'inventory123', role: 'inventory', name: 'Inventory Manager' },
        { id: 4, email: 'operator@erp.com', password: 'operator123', role: 'operator', name: 'Operator User' },
      ]

      const foundUser = mockUsers.find(u => u.email === email && u.password === password)
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(userWithoutPassword))
        toast.success(`Welcome back, ${userWithoutPassword.name}!`)
        return { success: true, user: userWithoutPassword }
      } else {
        toast.error('Invalid email or password')
        return { success: false, message: 'Invalid credentials' }
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
      return { success: false, message: 'Login failed' }
    }
  }

  const signup = async (userData) => {
    try {
      // Simulate API call
      const newUser = {
        id: Date.now(),
        ...userData,
        role: 'operator' // Default role for new users
      }
      const { password, ...userWithoutPassword } = newUser
      
      setUser(userWithoutPassword)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
      toast.success(`Account created successfully! Welcome, ${userWithoutPassword.name}!`)
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      toast.error('Registration failed. Please try again.')
      return { success: false, message: 'Registration failed' }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}