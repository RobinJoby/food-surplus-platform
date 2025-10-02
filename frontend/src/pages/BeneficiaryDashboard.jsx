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
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Beneficiary Dashboard</h1>
          <p className="mt-2 text-gray-600">Find and request food donations near you</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Available Nearby</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.available}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.requested}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Accepted</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.accepted}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Food */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Available Food Near You</h2>
              
              {/* Search and Filter */}
              <div className="mt-4 space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search food items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <label className="text-sm text-gray-600">Max distance:</label>
                  <select
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="input w-auto"
                  >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={20}>20 km</option>
                    <option value={50}>50 km</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="card-content">
              {filteredFood.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No food available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? 'No food items match your search criteria.'
                      : 'No food donations are available in your area right now.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {filteredFood.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              {item.quantity} {item.unit}
                            </span>
                            <span className="text-sm text-gray-500">
                              By: {item.donor_name}
                            </span>
                            {item.distance && (
                              <span className="text-sm text-gray-500 flex items-center">
                                <MapPin size={12} className="mr-1" />
                                {formatDistance(item.distance)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              Pickup: {formatDateTime(item.pickup_start)} - {formatDateTime(item.pickup_end)}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRequestPickup(item.id)}
                          className="btn-primary btn-sm ml-4"
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
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">My Pickup Requests</h2>
            </div>
            <div className="card-content">
              {myRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No requests yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Your pickup requests will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {myRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {request.food_item?.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            From: {request.food_item?.donor_name}
                          </p>
                          {request.message && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              Your message: "{request.message}"
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                              {getStatusText(request.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Requested: {formatDateTime(request.requested_at)}
                            </span>
                          </div>
                          
                          {request.status === 'accepted' && request.food_item && (
                            <div className="mt-2 p-2 bg-success-50 rounded-md">
                              <p className="text-sm text-success-800">
                                ✓ Request accepted! Pickup between {formatDateTime(request.food_item.pickup_start)} - {formatDateTime(request.food_item.pickup_end)}
                              </p>
                            </div>
                          )}
                          
                          {request.status === 'rejected' && (
                            <div className="mt-2 p-2 bg-red-50 rounded-md">
                              <p className="text-sm text-red-800">
                                Request was rejected by the donor.
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            className="btn-danger btn-sm ml-4"
                          >
                            Cancel
                          </button>
                        )}
                        
                        {request.status === 'accepted' && (
                          <button
                            onClick={() => pickupAPI.update(request.id, { status: 'picked' })}
                            className="btn-success btn-sm ml-4"
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
    </div>
  )
}

export default BeneficiaryDashboard
