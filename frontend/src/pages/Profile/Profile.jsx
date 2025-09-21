import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { User, Mail, Building, Edit3, Save, X } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    role: user?.role || 'operator'
  })

  const handleSave = () => {
    // In a real app, this would update the user in the backend
    console.log('Saving user data:', editedUser)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedUser({
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || '',
      role: user?.role || 'operator'
    })
    setIsEditing(false)
  }

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'operator', label: 'Operator' },
    { value: 'inventory', label: 'Inventory Manager' }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="btn-secondary px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1"
        >
          <div className="glass p-8 rounded-xl border border-slate-200 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-4xl font-bold shadow-xl">
                {(editedUser.name || editedUser.username || 'U')
                  .split(' ')
                  .map(p => p[0])
                  .join('')
                  .slice(0,2)
                  .toUpperCase()}
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur opacity-30 animate-pulse"></div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {editedUser.name || editedUser.username}
            </h2>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 mb-4">
              {roleOptions.find(r => r.value === editedUser.role)?.label || 'Operator'}
            </div>
          </div>
        </motion.div>

        {/* Profile Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="glass p-8 rounded-xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Profile Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                    className="input-enhanced w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-800">
                    {editedUser.name || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.username}
                    onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                    className="input-enhanced w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0"
                    placeholder="Enter your username"
                  />
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-800">
                    {editedUser.username || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                    className="input-enhanced w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-800">
                    {editedUser.email || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  Role
                </label>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={editedUser.role}
                      onChange={(e) => setEditedUser({...editedUser, role: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 appearance-none cursor-pointer hover:border-blue-300 transition-colors"
                    >
                      {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-800">
                    {roleOptions.find(r => r.value === editedUser.role)?.label || 'Not assigned'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile