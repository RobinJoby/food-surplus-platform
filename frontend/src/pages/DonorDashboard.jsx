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
          <h1 className="text-3xl font-bold text-gray-900">Donor Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your food donations and pickup requests</p>
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
                  <p className="text-sm font-medium text-gray-500">Total Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Available</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.available}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-8 w-8 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Requested</p>
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
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Food Items */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title">My Food Items</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary btn-sm flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Food</span>
                </button>
              </div>
            </div>
            <div className="card-content">
              {foodItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No food items</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating your first food donation.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-primary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Food Item
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
