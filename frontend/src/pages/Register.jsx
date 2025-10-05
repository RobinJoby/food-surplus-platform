import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react'
import { validateEmail, validatePhone, validateCoordinates } from '../utils/helpers'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'beneficiary',
    phone: '',
    address: '',
    latitude: '',
    longitude: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role'
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Phone number is invalid'
    }

    if (formData.latitude && formData.longitude) {
      if (!validateCoordinates(formData.latitude, formData.longitude)) {
        newErrors.coordinates = 'Invalid coordinates'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({}) // Clear any previous errors

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
      }

      const result = await register(userData)
      if (result.success) {
        // Navigate to home - DashboardRouter will handle role-based routing
        navigate('/')
      } else {
        // Handle specific registration errors
        if (result.error) {
          if (result.error.toLowerCase().includes('email already registered')) {
            setErrors({ email: 'This email is already registered. Please use a different email or try logging in.' })
          } else if (result.error.toLowerCase().includes('email')) {
            setErrors({ email: result.error })
          } else if (result.error.toLowerCase().includes('password')) {
            setErrors({ password: result.error })
          } else if (result.error.toLowerCase().includes('name')) {
            setErrors({ name: result.error })
          } else {
            setErrors({ general: result.error })
          }
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }))
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-700">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        <div className="flex flex-col items-center">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 underline">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form
          className="mt-4 space-y-6 bg-white bg-opacity-95 shadow-2xl rounded-2xl p-8 border border-gray-200 transition-all duration-300"
          onSubmit={handleSubmit}
        >
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4 mb-2 flex items-center space-x-2">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-red-800">{errors.general}</span>
            </div>
          )}
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-primary-400" />
              </span>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`input pl-10 rounded-lg shadow-inner bg-gray-50 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500'} transition`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <div className="mt-1 relative">
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
                className={`input pl-10 rounded-lg shadow-inner bg-gray-50 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500'} transition`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">I am a</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`input mt-1 rounded-lg bg-gray-50 border shadow-inner ${errors.role ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500'} transition`}
            >
              <option value="beneficiary">Beneficiary (NGO, Shelter, Individual)</option>
              <option value="donor">Donor (Restaurant, Household)</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
          </div>
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-primary-400" />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`input pl-10 pr-10 rounded-lg shadow-inner bg-gray-50 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500'} transition`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-400 hover:text-primary-600"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-primary-400" />
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input pl-10 pr-10 rounded-lg shadow-inner bg-gray-50 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500'} transition`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-400 hover:text-primary-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-primary-400" />
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`input pl-10 rounded-lg shadow-inner bg-gray-50 border ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500'} transition`}
                placeholder="Enter your phone number"
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address (Optional)</label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-primary-400" />
              </span>
              <input
                id="address"
                name="address"
                type="text"
                autoComplete="address-line1"
                value={formData.address}
                onChange={handleChange}
                className="input pl-10 rounded-lg shadow-inner bg-gray-50 border border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500 transition"
                placeholder="Enter your address"
              />
            </div>
          </div>
          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude (Optional)</label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                className="input mt-1 rounded-lg shadow-inner bg-gray-50 border border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500 transition"
                placeholder="40.7128"
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude (Optional)</label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                className="input mt-1 rounded-lg shadow-inner bg-gray-50 border border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500 transition"
                placeholder="-74.0060"
              />
            </div>
          </div>
          {errors.coordinates && <p className="mt-1 text-sm text-red-600">{errors.coordinates}</p>}
          <button
            type="button"
            onClick={getCurrentLocation}
            className="text-sm mt-2 text-primary-600 hover:text-primary-700 transition"
          >
            Use my current location
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 mt-4 rounded-lg font-bold text-white bg-gradient-to-r from-primary-500 to-violet-500 hover:from-primary-600 hover:to-violet-600 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center">
                <span className="spinner mr-2"></span>
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      </div>
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

export default Register
