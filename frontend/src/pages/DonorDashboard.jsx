import React, { useState, useEffect } from 'react'
import { Plus, Package, Clock, CheckCircle, XCircle, Eye, Edit } from 'lucide-react'
import { foodAPI, pickupAPI } from '../utils/api'
import { formatDateTime, formatTimeAgo, getStatusBadgeClass, getStatusText } from '../utils/helpers'
import toast from 'react-hot-toast'
import CreateFoodModal from '../components/CreateFoodModal'
import FoodItemCard from '../components/FoodItemCard'

const DonorDashboard = () => {
  const [foodItems, setFoodItems] = useState([])
  const [pickupRequests, setPickupRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    requested: 0,
    completed: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [foodResponse, requestsResponse] = await Promise.all([
        foodAPI.getAll(),
        pickupAPI.getAll()
      ])

      setFoodItems(foodResponse.data.food_items || [])
      setPickupRequests(requestsResponse.data.pickup_requests || [])

      // Calculate stats
      const items = foodResponse.data.food_items || []
      const requests = requestsResponse.data.pickup_requests || []

      console.log('Donor Dashboard - Food Items:', items)
      console.log('Donor Dashboard - Pickup Requests:', requests)
      console.log('Completed requests:', requests.filter(req => req.status === 'completed'))

      setStats({
        total: items.length,
        available: items.filter(item => item.status === 'available').length,
        requested: items.filter(item => item.status === 'requested' || item.status === 'accepted').length,
        completed: requests.filter(req => req.status === 'completed').length
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFood = async (foodData) => {
    try {
      await foodAPI.create(foodData)
      toast.success('Food item created successfully!')
      setShowCreateModal(false)
      fetchData()
    } catch (error) {
      console.error('Error creating food item:', error)
      toast.error('Failed to create food item')
    }
  }

  const handleRequestAction = async (requestId, action) => {
    try {
      await pickupAPI.update(requestId, { status: action })
      toast.success(`Request ${action} successfully!`)
      fetchData()
    } catch (error) {
      console.error('Error updating request:', error)
      toast.error(`Failed to ${action} request`)
    }
  }

  const handleStatusUpdate = async (foodId, status) => {
    try {
      await foodAPI.update(foodId, { status })
      toast.success('Status updated successfully!')
      fetchData()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 flex items-center justify-center">
        <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 border border-gray-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="spinner"></div>
            <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
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
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Donor Dashboard</h1>
                <p className="mt-2 text-gray-600">Manage your food donations and pickup requests</p>
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
                <p className="text-sm font-semibold text-gray-600">Total Items</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-emerald-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Available</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.available}</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-amber-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Requested</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.requested}</p>
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
          {/* Food Items */}
          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">My Food Items</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-md"
                >
                  <Plus size={16} />
                  <span>Add Food</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {foodItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">No food items</h3>
                  <p className="mt-2 text-sm text-gray-600">Get started by creating your first food donation.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Food Item</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {foodItems.map((item) => (
                    <FoodItemCard
                      key={item.id}
                      item={item}
                      onStatusUpdate={handleStatusUpdate}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pickup Requests */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Pickup Requests</h2>
            </div>
            <div className="card-content">
              {pickupRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pickup requests</h3>
                  <p className="mt-1 text-sm text-gray-500">Requests will appear here when beneficiaries request your food items.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {pickupRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {request.food_item?.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Requested by: {request.beneficiary_name}
                          </p>
                          {request.message && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              "{request.message}"
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                              {getStatusText(request.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(request.requested_at)}
                            </span>
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleRequestAction(request.id, 'accepted')}
                              className="btn-success btn-sm"
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleRequestAction(request.id, 'rejected')}
                              className="btn-danger btn-sm"
                            >
                              <XCircle size={14} className="mr-1" />
                              Reject
                            </button>
                          </div>
                        )}

                        {request.status === 'accepted' && (
                          <button
                            onClick={() => handleRequestAction(request.id, 'picked')}
                            className="btn-primary btn-sm ml-4"
                          >
                            Mark as Picked
                          </button>
                        )}

                        {request.status === 'picked' && (
                          <button
                            onClick={() => handleRequestAction(request.id, 'completed')}
                            className="btn-success btn-sm ml-4"
                          >
                            Complete
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

      {/* Create Food Modal */}
      {showCreateModal && (
        <CreateFoodModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateFood}
        />
      )}
    </div>
  )
}

export default DonorDashboard
