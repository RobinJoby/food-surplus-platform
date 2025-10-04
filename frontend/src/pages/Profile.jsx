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
      <div className="min-h-screen bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 flex items-center justify-center">
        <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 border border-gray-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="spinner"></div>
            <p className="text-gray-600 font-semibold">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 transition-colors duration-700">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 border border-gray-200 hover:border-primary-300 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Profile Settings</h1>
                <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300">
              <div className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                <div className="mt-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${user.role === 'donor' ? 'bg-gradient-to-r from-primary-100 to-violet-100 text-primary-700 border border-primary-300' :
                    user.role === 'beneficiary' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300' :
                      'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-300'
                    }`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                {user.verified && (
                  <div className="mt-3 flex items-center justify-center text-green-600 bg-green-50 rounded-lg p-2 border border-green-200">
                    <Shield size={16} className="mr-2" />
                    <span className="text-sm font-semibold">Verified Account</span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300 mt-8">
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-lg font-bold text-gray-900">Account Information</h4>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center text-sm bg-gray-50 rounded-lg p-3">
                    <Mail size={16} className="text-primary-500 mr-3" />
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="ml-2 text-gray-900 font-semibold">{user.email}</span>
                  </div>

                  {user.phone && (
                    <div className="flex items-center text-sm bg-gray-50 rounded-lg p-3">
                      <Phone size={16} className="text-primary-500 mr-3" />
                      <span className="text-gray-600 font-medium">Phone:</span>
                      <span className="ml-2 text-gray-900 font-semibold">{user.phone}</span>
                    </div>
                  )}

                  {user.address && (
                    <div className="flex items-start text-sm bg-gray-50 rounded-lg p-3">
                      <MapPin size={16} className="text-primary-500 mr-3 mt-0.5" />
                      <div>
                        <span className="text-gray-600 font-medium">Address:</span>
                        <p className="text-gray-900 font-semibold mt-1">{user.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center text-sm bg-gray-50 rounded-lg p-3">
                    <User size={16} className="text-primary-500 mr-3" />
                    <span className="text-gray-600 font-medium">Member since:</span>
                    <span className="ml-2 text-gray-900 font-semibold">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
                <p className="mt-2 text-gray-600">
                  Update your personal information and location details
                </p>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                      Full Name *
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-primary-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-primary-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                      Address
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <MapPin className="h-5 w-5 text-primary-400" />
                      </div>
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium resize-none"
                        placeholder="Enter your full address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="latitude" className="block text-sm font-semibold text-gray-700">
                        Latitude
                      </label>
                      <input
                        type="number"
                        id="latitude"
                        name="latitude"
                        step="any"
                        value={formData.latitude}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium mt-2"
                        placeholder="40.7128"
                      />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block text-sm font-semibold text-gray-700">
                        Longitude
                      </label>
                      <input
                        type="number"
                        id="longitude"
                        name="longitude"
                        step="any"
                        value={formData.longitude}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium mt-2"
                        placeholder="-74.0060"
                      />
                    </div>
                  </div>

                  {errors.coordinates && (
                    <p className="text-sm text-red-600 font-medium">{errors.coordinates}</p>
                  )}

                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="text-sm text-primary-600 hover:text-primary-500 font-semibold px-3 py-2 rounded-lg hover:bg-primary-50 transition"
                  >
                    Use my current location
                  </button>

                  <div className="pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-bold rounded-lg hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="spinner mr-3"></div>
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
            <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300 mt-8">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Security</h3>
                <p className="mt-2 text-gray-600">
                  Manage your account security settings
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Email Address</h4>
                      <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md text-sm">
                      Change Email
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Password</h4>
                      <p className="text-sm text-gray-600 mt-1">Last updated 30 days ago</p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md text-sm">
                      Change Password
                    </button>
                  </div>

                  {!user.verified && user.role !== 'admin' && (
                    <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Account Verification</h4>
                        <p className="text-sm text-gray-600 mt-1">Verify your organization for increased trust</p>
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-lg text-sm">
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

      {/* Animation Styles */}
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
      `}</style>
    </div>
  )
}

export default Profile