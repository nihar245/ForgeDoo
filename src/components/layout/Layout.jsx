import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Factory, 
  LayoutDashboard, 
  Package, 
  Users, 
  Warehouse, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import brandLogo from '../../../mockup/logo.jpeg'

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [compactMode, setCompactMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('compactMode') || 'false')
    } catch {
      return false
    }
  })

  useEffect(() => {
    localStorage.setItem('compactMode', JSON.stringify(compactMode))
    if (compactMode) {
      document.body.classList.add('compact-mode')
    } else {
      document.body.classList.remove('compact-mode')
    }
  }, [compactMode])

  const menuItems = [
    { name: 'Manufacturing Orders', icon: Package, path: '/manufacturing-orders', roles: ['admin', 'manager'] },
    { name: 'Work Orders', icon: Users, path: '/work-orders', roles: ['admin', 'manager', 'operator'] },
    { name: 'Work Centers', icon: Factory, path: '/work-centers', roles: ['admin', 'manager'] },
    { name: 'Stock Ledger', icon: Warehouse, path: '/stock-ledger', roles: ['admin', 'manager', 'inventory'] },
    { name: 'Bill of Materials', icon: FileText, path: '/bom', roles: ['admin', 'manager'] },
    { name: 'Reports & Analytics', icon: BarChart3, path: '/reports', roles: ['admin', 'manager', 'inventory'] },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'operator')
  )

  // Sidebar menu items (remove Reports & Analytics from left menu)
  const sidebarMenuItems = filteredMenuItems.filter(item => item.name !== 'Reports & Analytics')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const notifications = [
    { id: 1, message: 'New manufacturing order #MO001 created', time: '2 mins ago' },
    { id: 2, message: 'Low stock alert: Wooden legs (10 units remaining)', time: '5 mins ago' },
    { id: 3, message: 'Work order WO-001 completed by Operator John', time: '15 mins ago' },
  ]

  return (
  <div className="min-h-screen bg-white flex overflow-x-hidden max-w-[100vw] w-full">
      {/* Sidebar */}
      <div className="hidden"></div>

      {/* Main Content */}
  <div className="flex-1 lg:pl-0">
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 glass border-b border-gray-200">
          <div className="max-w-[100vw] mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="grid grid-cols-[auto_1fr_auto] items-center">
              {/* Left: Hamburger to open Master Menu */}
              <div className="justify-self-start">
                <button
                  onClick={() => setSidebarOpen(v => !v)}
                  className="bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-all"
                  aria-label="Open menu"
                  title="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
              {/* Center: Logo + Company Name */}
              <div className="justify-self-center flex items-center gap-2">
                <Link to="/" className="inline-flex items-center">
                  <img
                    src={brandLogo}
                    alt="Manufacturing ERP Logo"
                    className="w-10 h-10 rounded-lg object-contain ring-1 ring-gray-200 shadow-sm"
                  />
                </Link>
                <span className="text-lg font-bold text-slate-800">ForgeDoo</span>
              </div>
              {/* Right: Bell + Avatar/Login + Greeting */}
              <div className="hidden md:flex items-center gap-3 justify-self-end">
                <button className="bg-slate-50 p-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200" aria-label="Notifications">
                  <Bell className="w-5 h-5" />
                </button>
                {isAuthenticated ? (
                  <>
                    {/* Avatar with initials and dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setSettingsOpen(v => !v)}
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                        aria-label="Profile menu"
                      >
                        {(user?.name || user?.username || 'U')
                          .split(' ')
                          .map(p => p[0])
                          .join('')
                          .slice(0,2)
                          .toUpperCase()}
                      </button>
                      {settingsOpen && (
                        <div className="absolute right-0 mt-2 w-64 glass rounded-lg shadow-lg p-4 z-50 border border-slate-200">
                          {/* User Info Section */}
                          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-lg font-bold">
                              {(user?.name || user?.username || 'U')
                                .split(' ')
                                .map(p => p[0])
                                .join('')
                                .slice(0,2)
                                .toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-800">{user?.name || user?.username || 'User'}</div>
                              <div className="text-sm text-slate-500">{user?.email || 'user@forgedoo.com'}</div>
                              <div className="text-xs text-blue-600 font-medium capitalize">{user?.role || 'operator'}</div>
                            </div>
                          </div>
                          {/* Menu Items */}
                          <div className="space-y-1">
                            <Link to="/profile" className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">My Profile</Link>
                            <Link to="/reports" className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">My Reports</Link>
                            <hr className="my-2 border-slate-200" />
                            <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors">Logout</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-800">Hey! {user?.name || user?.username || 'User'}</span>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-black transition"
                  >
                    Login
                  </Link>
                )}
              </div>
              {/* Mobile: Right cluster (menu + bell + login/avatar) */}
              <div className="md:hidden col-span-2 justify-self-end flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen(v => !v)}
                  className="bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-all"
                  aria-label="Open menu"
                  title="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <button className="bg-slate-50 p-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200" aria-label="Notifications">
                  <Bell className="w-5 h-5" />
                </button>
                {isAuthenticated ? (
                  <button
                    onClick={() => setSettingsOpen(v => !v)}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                    aria-label="Profile menu"
                  >
                    {(user?.name || user?.username || 'U')
                      .split(' ')
                      .map(p => p[0])
                      .join('')
                      .slice(0,2)
                      .toUpperCase()}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-black transition"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
            {/* Left Drawer is handled below with AnimatePresence */}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 overflow-x-hidden">
          <div className="w-full max-w-[100vw] mx-auto overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
          </div>
        </main>
      </div>

      {/* Drawer + Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <motion.aside
              initial={{ x: -320, opacity: 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 1 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[80vw] glass border-r border-gray-200 p-4 overflow-y-auto"
              role="dialog"
              aria-label="Master Menu"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <img src={brandLogo} alt="Logo" className="w-8 h-8 rounded-lg ring-1 ring-slate-200" />
                  <span className="font-bold text-slate-800">ForgeDoo</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {sidebarMenuItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                          : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:transform hover:scale-102'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </div>
                    </Link>
                  )
                })}
                {/* Reports removed from left side menu as per requirement */}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Layout