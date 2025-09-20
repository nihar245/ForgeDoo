import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Factory, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import brandLogo from '../../../mockup/logo.jpeg'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
  await login(formData.email, formData.password)
  navigate('/manufacturing-orders')
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { email: 'admin@erp.com', password: 'admin123', role: 'Admin' },
    { email: 'manager@erp.com', password: 'manager123', role: 'Manager' },
    { email: 'inventory@erp.com', password: 'inventory123', role: 'Inventory Manager' },
    { email: 'operator@erp.com', password: 'operator123', role: 'Operator' },
  ]

  const handleDemoLogin = (account) => {
    setFormData({ email: account.email, password: account.password })
  }

  return (
  <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center">
            <div style={{ width: 96, height: 84 }} className="flex items-center justify-center">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl ring-2 ring-blue-200 shadow-sm">
                <img 
                  src={brandLogo} 
                  alt="ForgeDoo Logo" 
                  className="w-16 h-16 object-contain filter drop-shadow-sm"
                  style={{
                    filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.4))'
                  }}
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Login Form */}
        <div className="card-elevated p-8 rounded-2xl border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 hover:border-blue-300 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 hover:border-blue-300 transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-3">Demo Accounts - Click to Login</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {demoAccounts.map((account, index) => (
                <motion.button
                  key={account.role}
                  onClick={() => handleDemoLogin(account)}
                  className="btn-secondary p-3 rounded-lg text-xs font-medium text-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="font-semibold">{account.role}</div>
                  <div className="text-gray-500 text-xs">{account.email}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-gray-800 hover:text-black font-medium">
                Sign up
              </Link>
            </p>
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-700 mt-2 inline-block">
              Forgot your password?
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login