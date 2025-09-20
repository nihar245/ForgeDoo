import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Factory, Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import brandLogo from '../../../mockup/logo.jpeg'

const SignUp = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    
    const result = await signup(formData)
    
    if (result.success) {
      navigate('/dashboard')
    }
    
    setLoading(false)
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

        {/* Sign Up Form */}
        <div className="card-elevated p-8 rounded-2xl border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join our manufacturing management platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 hover:border-blue-300 transition-colors"
                required
              />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 hover:border-blue-300 transition-colors"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

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

            {/* Company Name removed per request */}

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
                  placeholder="Create a password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 hover:border-blue-300 transition-colors"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-gray-800 hover:text-black font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default SignUp