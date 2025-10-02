import React, { useState } from 'react'
import { User, Mail, Phone, MapPin, Shield, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getRoleDisplayName, validateEmail, validatePhone, validateCoordinates } from '../utils/helpers'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    latitude: user?.latitude || '',
    longitude: user?.longitude || ''
  })
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
    try {
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
      }
      
      await updateProfile(updateData)
    } catch (error) {
      console.error('Error updating profile:', error)
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
          toast.error('Unable to get your location')
        }
      )
    } else {
      toast.error('Geolocation is not supported by this browser')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-content text-center">
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-4">
                  <span className={`badge ${user.role === 'donor' ? 'badge-primary' : user.role === 'beneficiary' ? 'badge-success' : 'badge-danger'}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                {user.verified && (
                  <div className="mt-2 flex items-center justify-center text-success-600">
                    <Shield size={16} className="mr-1" />
                    <span className="text-sm">Verified Account</span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Stats */}
            <div className="card mt-6">
              <div className="card-header">
                <h4 className="card-title text-base">Account Information</h4>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail size={16} className="text-gray-400 mr-3" />
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 text-gray-900">{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center text-sm">
                      <Phone size={16} className="text-gray-400 mr-3" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 text-gray-900">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.address && (
                    <div className="flex items-start text-sm">
                      <MapPin size={16} className="text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <span className="text-gray-600">Address:</span>
                        <p className="text-gray-900 mt-1">{user.address}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <User size={16} className="text-gray-400 mr-3" />
                    <span className="text-gray-600">Member since:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Edit Profile</h3>
                <p className="card-description">
                  Update your personal information and location details
                </p>
              </div>
              <div className="card-content">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`input pl-10 ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`input pl-10 ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        className="textarea pl-10"
                        placeholder="Enter your full address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                        Latitude
                      </label>
                      <input
                        type="number"
                        id="latitude"
                        name="latitude"
                        step="any"
                        value={formData.latitude}
                        onChange={handleChange}
                        className="input mt-1"
                        placeholder="40.7128"
                      />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                        Longitude
                      </label>
                      <input
                        type="number"
                        id="longitude"
                        name="longitude"
                        step="any"
                        value={formData.longitude}
                        onChange={handleChange}
                        className="input mt-1"
                        placeholder="-74.0060"
                      />
                    </div>
                  </div>
                  
                  {errors.coordinates && (
                    <p className="text-sm text-red-600">{errors.coordinates}</p>
                  )}

                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Use my current location
                  </button>

                  <div className="pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="spinner mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Security Section */}
            <div className="card mt-6">
              <div className="card-header">
                <h3 className="card-title">Security</h3>
                <p className="card-description">
                  Manage your account security settings
                </p>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Address</h4>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button className="btn-secondary btn-sm">
                      Change Email
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Password</h4>
                      <p className="text-sm text-gray-500">Last updated 30 days ago</p>
                    </div>
                    <button className="btn-secondary btn-sm">
                      Change Password
                    </button>
                  </div>
                  
                  {!user.verified && user.role !== 'admin' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Account Verification</h4>
                        <p className="text-sm text-gray-500">Verify your organization for increased trust</p>
                      </div>
                      <button className="btn-primary btn-sm">
                        Request Verification
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
