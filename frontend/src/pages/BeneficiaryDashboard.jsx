import React, { useState, useEffect } from 'react'
import { MapPin, Clock, Package, CheckCircle, Search, Filter } from 'lucide-react'
import { foodAPI, pickupAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { formatDateTime, formatDistance, getStatusBadgeClass, getStatusText } from '../utils/helpers'
import toast from 'react-hot-toast'
import FoodItemCard from '../components/FoodItemCard'

const BeneficiaryDashboard = () => {
  const { user } = useAuth()
  const [availableFood, setAvailableFood] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [maxDistance, setMaxDistance] = useState(10)
  const [stats, setStats] = useState({
    available: 0,
    requested: 0,
    accepted: 0,
    completed: 0
  })

  useEffect(() => {
    fetchData()
  }, [maxDistance])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [foodResponse, requestsResponse] = await Promise.all([
        foodAPI.getAll({ status: 'available', max_distance: maxDistance }),
        pickupAPI.getAll()
      ])

      setAvailableFood(foodResponse.data.food_items || [])
      setMyRequests(requestsResponse.data.pickup_requests || [])

      // Calculate stats - only count current user's requests
      const requests = requestsResponse.data.pickup_requests || []
      const myRequests = requests.filter(req => req.beneficiary_id === user.id)

      setStats({
        available: foodResponse.data.food_items?.length || 0,
        requested: myRequests.filter(req => req.status === 'pending').length,
        accepted: myRequests.filter(req => req.status === 'accepted' || req.status === 'picked').length,
        completed: myRequests.filter(req => req.status === 'completed').length
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPickup = async (foodItemId, message = '') => {
    try {
      await pickupAPI.create({
        food_item_id: foodItemId,
        message
      })
      toast.success('Pickup request sent successfully!')
      fetchData()
    } catch (error) {
      console.error('Error requesting pickup:', error)
      toast.error('Failed to send pickup request')
    }
  }

  const handleCancelRequest = async (requestId) => {
    try {
      await pickupAPI.update(requestId, { status: 'cancelled' })
      toast.success('Request cancelled successfully!')
      fetchData()
    } catch (error) {
      console.error('Error cancelling request:', error)
      toast.error('Failed to cancel request')
    }
  }

  const filteredFood = availableFood.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 flex items-center justify-center">
        <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 border border-gray-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="spinner"></div>
            <p className="text-gray-600 font-semibold">Finding food for you...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 border border-gray-200 hover:border-primary-300 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Beneficiary Dashboard</h1>
                <p className="mt-2 text-gray-600">Find and request food donations near you</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-primary-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Available Nearby</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.available}</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-amber-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Pending Requests</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.requested}</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-green-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Accepted</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.accepted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-emerald-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Completed</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
          {/* Available Food */}
          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Available Food Near You</h2>

              {/* Search and Filter */}
              <div className="mt-4 space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-primary-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search food items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Filter className="h-5 w-5 text-primary-400" />
                  <label className="text-sm font-semibold text-gray-700">Max distance:</label>
                  <select
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition"
                  >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={20}>20 km</option>
                    <option value={50}>50 km</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6">
              {filteredFood.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">No food available</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {searchTerm
                      ? 'No food items match your search criteria.'
                      : 'No food donations are available in your area right now.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {filteredFood.map((item) => (
                    <div key={item.id} className="bg-gradient-to-r from-gray-50 to-primary-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-sm text-gray-600 font-semibold">
                              {item.quantity} {item.unit}
                            </span>
                            <span className="text-sm text-gray-600 font-semibold">
                              By: {item.donor_name}
                            </span>
                            {item.distance && (
                              <span className="text-sm text-gray-600 flex items-center font-semibold">
                                <MapPin size={12} className="mr-1" />
                                {formatDistance(item.distance)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center mt-2">
                            <span className="text-xs text-gray-500 font-medium">
                              Pickup: {formatDateTime(item.pickup_start)} - {formatDateTime(item.pickup_end)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRequestPickup(item.id)}
                          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-md text-sm ml-4"
                        >
                          Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Requests */}
          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">My Pickup Requests</h2>
            </div>
            <div className="p-6">
              {myRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">No requests yet</h3>
                  <p className="mt-2 text-sm text-gray-600">Your pickup requests will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {myRequests.map((request) => (
                    <div key={request.id} className="bg-gradient-to-r from-gray-50 to-primary-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-gray-900">
                            {request.food_item?.title}
                          </h4>
                          <p className="text-sm text-gray-700 mt-1 font-semibold">
                            From: {request.food_item?.donor_name}
                          </p>
                          {request.message && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              Your message: "{request.message}"
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(request.status)}`}>
                              {getStatusText(request.status)}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              Requested: {formatDateTime(request.requested_at)}
                            </span>
                          </div>

                          {request.status === 'accepted' && request.food_item && (
                            <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                              <p className="text-sm text-emerald-800 font-semibold">
                                ✓ Request accepted! Pickup between {formatDateTime(request.food_item.pickup_start)} - {formatDateTime(request.food_item.pickup_end)}
                              </p>
                            </div>
                          )}

                          {request.status === 'rejected' && (
                            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                              <p className="text-sm text-red-800 font-semibold">
                                Request was rejected by the donor.
                              </p>
                            </div>
                          )}
                        </div>

                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md text-sm ml-4"
                          >
                            Cancel
                          </button>
                        )}

                        {request.status === 'accepted' && (
                          <button
                            onClick={() => pickupAPI.update(request.id, { status: 'picked' })}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md text-sm ml-4"
                          >
                            Mark Picked
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #6366f1, #8b5cf6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #4f46e5, #7c3aed);
        }
      `}</style>
    </div>
  )
}

export default BeneficiaryDashboard
