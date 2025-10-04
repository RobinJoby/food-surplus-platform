import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shakeForm, setShakeForm] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.email) {
      toast.error('Email is required')
      setShakeForm(true)
      setTimeout(() => setShakeForm(false), 500)
      return false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      setShakeForm(true)
      setTimeout(() => setShakeForm(false), 500)
      return false
    }
    if (!formData.password) {
      toast.error('Password is required')
      setShakeForm(true)
      setTimeout(() => setShakeForm(false), 500)
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      const result = await login(formData.email, formData.password)
      if (result && result.success) {
        toast.success('Welcome back! Login successful.')
        setFormData({ email: '', password: '' })
        navigate('/')
      } else {
        toast.error('Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Connection error. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-700">
      <div className="max-w-md w-full animate-fade-in-up">
        {/* Logo / Brand */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Brand Logo"
            className="h-14 w-14 rounded-full shadow-lg border-2 border-primary-300 object-cover bg-white"
          />
        </div>
        {/* Card */}
        <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 border border-gray-200 hover:border-primary-300 transition-all duration-300">
          {/* Header section */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link
                to="/register"
                className="font-semibold text-primary-600 hover:text-primary-700 underline"
              >
                create a new account
              </Link>
            </p>
          </div>
          {/* Form section */}
          <form
            className={`space-y-5 animate-fade-in ${shakeForm ? 'shake' : ''}`}
            onSubmit={handleSubmit}
          >
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-primary-400" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10 focus:ring-primary-500 focus:border-primary-500 rounded-lg shadow-inner bg-gray-50 border border-gray-200 hover:border-primary-300 transition"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-primary-400" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-12 focus:ring-primary-500 focus:border-primary-500 rounded-lg shadow-inner bg-gray-50 border border-gray-200 hover:border-primary-300 transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-500 transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border-0 text-base font-bold rounded-lg text-white bg-gradient-to-r from-primary-500 to-violet-500 hover:from-primary-600 hover:to-violet-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 disabled:opacity-60 transition-all duration-200 shadow-md"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="spinner mr-2"></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Animations */}
      <style jsx="true" global="true">{`
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .shake {
          animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid #A5B4FC;
          border-top: 2.5px solid #6366F1;
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  )
}

export default Login
