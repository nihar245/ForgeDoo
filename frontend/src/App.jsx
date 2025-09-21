import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Context
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Landing from './pages/Auth/Landing'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Dashboard from './pages/Dashboard/Dashboard'
import ManufacturingOrders from './pages/ManufacturingOrders/ManufacturingOrders'
import MODetail from './pages/ManufacturingOrders/MODetail'
import WorkOrders from './pages/WorkOrders/WorkOrders'
import StockLedger from './pages/StockLedger/StockLedger'
import BOM from './pages/BOM/BOM'
import BOMDetail from './pages/BOM/BOMDetail'
import Reports from './pages/Reports/Reports'
import MyOrders from './pages/MyOrders/MyOrders'
import WorkCenters from './pages/WorkCenters/WorkCenters'
import Profile from './pages/Profile/Profile'

// Layout
import Layout from './components/layout/Layout'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(226, 232, 240, 0.6)',
                  color: '#1e293b',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.08)',
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/manufacturing-orders" element={
                <ProtectedRoute>
                  <Layout>
                    <ManufacturingOrders />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/manufacturing-orders/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <MODetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/work-orders" element={
                <ProtectedRoute>
                  <Layout>
                    <WorkOrders />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/stock-ledger" element={
                <ProtectedRoute>
                  <Layout>
                    <StockLedger />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/bom" element={
                <ProtectedRoute>
                  <Layout>
                    <BOM />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/bom/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <BOMDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/my-orders" element={
                <ProtectedRoute>
                  <Layout>
                    <MyOrders />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/work-centers" element={
                <ProtectedRoute>
                  <Layout>
                    <WorkCenters />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </DndProvider>
  )
}

export default App
