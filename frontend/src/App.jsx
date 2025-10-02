import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import DonorDashboard from './pages/DonorDashboard'
import BeneficiaryDashboard from './pages/BeneficiaryDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import FoodMap from './pages/FoodMap'
import Notifications from './pages/Notifications'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return children
}

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }
  
  if (user) {
    // Redirect based on user role
    switch (user.role) {
      case 'donor':
        return <Navigate to="/donor" replace />
      case 'beneficiary':
        return <Navigate to="/beneficiary" replace />
      case 'admin':
        return <Navigate to="/admin" replace />
      default:
        return <Navigate to="/" replace />
    }
  }
  
  return children
}

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth()
  
  if (!user) return <Navigate to="/login" replace />
  
  switch (user.role) {
    case 'donor':
      return <DonorDashboard />
    case 'beneficiary':
      return <BeneficiaryDashboard />
    case 'admin':
      return <AdminDashboard />
    default:
      return <Navigate to="/login" replace />
  }
}

// Unauthorized Page
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
      <p className="text-xl text-gray-600 mb-8">Unauthorized Access</p>
      <p className="text-gray-500 mb-8">You don't have permission to access this page.</p>
      <button 
        onClick={() => window.history.back()} 
        className="btn-primary"
      >
        Go Back
      </button>
    </div>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } />
              
              <Route path="/donor" element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/beneficiary" element={
                <ProtectedRoute allowedRoles={['beneficiary']}>
                  <BeneficiaryDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/map" element={
                <ProtectedRoute>
                  <FoodMap />
                </ProtectedRoute>
              } />
              
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              
              {/* Error Routes */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
                    <button 
                      onClick={() => window.history.back()} 
                      className="btn-primary"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4ade80',
                },
              },
              error: {
                duration: 5000,
                theme: {
                  primary: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
