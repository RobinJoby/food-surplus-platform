import React, { useState } from 'react'
import { X, Upload, MapPin } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { validateCoordinates } from '../utils/helpers'

const CreateFoodModal = ({ onClose, onSubmit }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'servings',
    expiry_date: '',
    pickup_start: '',
    pickup_end: '',
    location: user?.address || '',
    latitude: user?.latitude || '',
    longitude: user?.longitude || '',
    image_url: ''
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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (!formData.pickup_start) {
      newErrors.pickup_start = 'Pickup start time is required'
    }

    if (!formData.pickup_end) {
      newErrors.pickup_end = 'Pickup end time is required'
    }

    if (formData.pickup_start && formData.pickup_end) {
      const startDate = new Date(formData.pickup_start)
      const endDate = new Date(formData.pickup_end)
      const now = new Date()

      if (startDate < now) {
        newErrors.pickup_start = 'Pickup start time must be in the future'
      }

      if (endDate <= startDate) {
        newErrors.pickup_end = 'Pickup end time must be after start time'
      }
    }

    if (formData.expiry_date) {
      const expiryDate = new Date(formData.expiry_date)
      const now = new Date()

      if (expiryDate < now) {
        newErrors.expiry_date = 'Expiry date must be in the future'
      }
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
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
      }
      
      await onSubmit(submitData)
    } catch (error) {
      console.error('Error submitting form:', error)
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

  const generateTimeOptions = () => {
    const options = []
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    for (let i = 0; i < 48; i++) { // Next 48 hours
      const time = new Date(now.getTime() + (i * 60 * 60 * 1000))
      const timeString = time.toISOString().slice(0, 16)
      const displayString = time.toLocaleString()
      options.push({ value: timeString, label: displayString })
    }
    
    return options
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Food Donation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Food Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input mt-1 ${errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="e.g., Fresh Pasta and Marinara Sauce"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="textarea mt-1"
                placeholder="Describe the food, any special instructions, etc."
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className={`input mt-1 ${errors.quantity ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="10"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input mt-1"
              >
                <option value="servings">Servings</option>
                <option value="pieces">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="lbs">Pounds</option>
                <option value="boxes">Boxes</option>
                <option value="bags">Bags</option>
              </select>
            </div>

            <div>
              <label htmlFor="pickup_start" className="block text-sm font-medium text-gray-700">
                Pickup Start Time *
              </label>
              <input
                type="datetime-local"
                id="pickup_start"
                name="pickup_start"
                value={formData.pickup_start}
                onChange={handleChange}
                className={`input mt-1 ${errors.pickup_start ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              />
              {errors.pickup_start && (
                <p className="mt-1 text-sm text-red-600">{errors.pickup_start}</p>
              )}
            </div>

            <div>
              <label htmlFor="pickup_end" className="block text-sm font-medium text-gray-700">
                Pickup End Time *
              </label>
              <input
                type="datetime-local"
                id="pickup_end"
                name="pickup_end"
                value={formData.pickup_end}
                onChange={handleChange}
                className={`input mt-1 ${errors.pickup_end ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              />
              {errors.pickup_end && (
                <p className="mt-1 text-sm text-red-600">{errors.pickup_end}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">
                Expiry Date (Optional)
              </label>
              <input
                type="datetime-local"
                id="expiry_date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className={`input mt-1 ${errors.expiry_date ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              />
              {errors.expiry_date && (
                <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Pickup Location
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter pickup address"
                />
              </div>
            </div>

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

            {errors.coordinates && (
              <div className="md:col-span-2">
                <p className="text-sm text-red-600">{errors.coordinates}</p>
              </div>
            )}

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Use my current location
              </button>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                Image URL (Optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Food Donation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateFoodModal
