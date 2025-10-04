import React, { useState } from 'react'
import { X, Upload, MapPin, Package, Clock, FileText } from 'lucide-react'
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-violet-50">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Create Food Donation</h2>
                            <p className="text-sm text-gray-600">Share your surplus food with those in need</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Title */}
                        <div className="md:col-span-2">
                            <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                                Food Title *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FileText className="h-5 w-5 text-primary-400" />
                                </div>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium ${errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="e.g., Fresh Pasta and Marinara Sauce"
                                />
                            </div>
                            {errors.title && (
                                <p className="mt-2 text-sm text-red-600 font-medium">{errors.title}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                                Description
                            </label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <FileText className="h-5 w-5 text-primary-400" />
                                </div>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium resize-none"
                                    placeholder="Describe the food, any special instructions, dietary information, etc."
                                />
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-bold text-gray-700 mb-2">
                                Quantity *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Package className="h-5 w-5 text-primary-400" />
                                </div>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium ${errors.quantity ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="10"
                                />
                            </div>
                            {errors.quantity && (
                                <p className="mt-2 text-sm text-red-600 font-medium">{errors.quantity}</p>
                            )}
                        </div>

                        {/* Unit */}
                        <div>
                            <label htmlFor="unit" className="block text-sm font-bold text-gray-700 mb-2">
                                Unit
                            </label>
                            <select
                                id="unit"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium"
                            >
                                <option value="servings">Servings</option>
                                <option value="pieces">Pieces</option>
                                <option value="kg">Kilograms</option>
                                <option value="lbs">Pounds</option>
                                <option value="boxes">Boxes</option>
                                <option value="bags">Bags</option>
                            </select>
                        </div>

                        {/* Pickup Times */}
                        <div>
                            <label htmlFor="pickup_start" className="block text-sm font-bold text-gray-700 mb-2">
                                Pickup Start Time *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Clock className="h-5 w-5 text-primary-400" />
                                </div>
                                <input
                                    type="datetime-local"
                                    id="pickup_start"
                                    name="pickup_start"
                                    value={formData.pickup_start}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium ${errors.pickup_start ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {errors.pickup_start && (
                                <p className="mt-2 text-sm text-red-600 font-medium">{errors.pickup_start}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="pickup_end" className="block text-sm font-bold text-gray-700 mb-2">
                                Pickup End Time *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Clock className="h-5 w-5 text-primary-400" />
                                </div>
                                <input
                                    type="datetime-local"
                                    id="pickup_end"
                                    name="pickup_end"
                                    value={formData.pickup_end}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium ${errors.pickup_end ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {errors.pickup_end && (
                                <p className="mt-2 text-sm text-red-600 font-medium">{errors.pickup_end}</p>
                            )}
                        </div>

                        {/* Expiry Date */}
                        <div className="md:col-span-2">
                            <label htmlFor="expiry_date" className="block text-sm font-bold text-gray-700 mb-2">
                                Expiry Date (Optional)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Clock className="h-5 w-5 text-amber-400" />
                                </div>
                                <input
                                    type="datetime-local"
                                    id="expiry_date"
                                    name="expiry_date"
                                    value={formData.expiry_date}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-amber-500 focus:border-amber-500 bg-amber-50 hover:border-amber-300 transition font-medium ${errors.expiry_date ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-amber-300'
                                        }`}
                                />
                            </div>
                            {errors.expiry_date && (
                                <p className="mt-2 text-sm text-red-600 font-medium">{errors.expiry_date}</p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="md:col-span-2">
                            <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-2">
                                Pickup Location
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-emerald-400" />
                                </div>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50 hover:border-emerald-300 transition font-medium"
                                    placeholder="Enter pickup address"
                                />
                            </div>
                        </div>

                        {/* Coordinates */}
                        <div>
                            <label htmlFor="latitude" className="block text-sm font-bold text-gray-700 mb-2">
                                Latitude
                            </label>
                            <input
                                type="number"
                                id="latitude"
                                name="latitude"
                                step="any"
                                value={formData.latitude}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium"
                                placeholder="40.7128"
                            />
                        </div>

                        <div>
                            <label htmlFor="longitude" className="block text-sm font-bold text-gray-700 mb-2">
                                Longitude
                            </label>
                            <input
                                type="number"
                                id="longitude"
                                name="longitude"
                                step="any"
                                value={formData.longitude}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium"
                                placeholder="-74.0060"
                            />
                        </div>

                        {errors.coordinates && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-red-600 font-medium">{errors.coordinates}</p>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                className="text-sm text-primary-600 hover:text-primary-500 font-semibold px-3 py-2 rounded-lg hover:bg-primary-50 transition"
                            >
                                📍 Use my current location
                            </button>
                        </div>

                        {/* Image URL */}
                        <div className="md:col-span-2">
                            <label htmlFor="image_url" className="block text-sm font-bold text-gray-700 mb-2">
                                Image URL (Optional)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Upload className="h-5 w-5 text-violet-400" />
                                </div>
                                <input
                                    type="url"
                                    id="image_url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-violet-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 bg-violet-50 hover:border-violet-300 transition font-medium"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end space-x-6 pt-8 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-bold rounded-lg hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner mr-3"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Package className="mr-2 h-5 w-5" />
                                    Create Food Donation
                                </>
                            )}
                        </button>
                    </div>
                </form>
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

export default CreateFoodModal