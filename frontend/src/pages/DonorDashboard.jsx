import React, { useState, useEffect } from 'react'
import { Plus, Package, Clock, CheckCircle, XCircle, Eye, Edit } from 'lucide-react'
import { foodAPI, pickupAPI } from '../utils/api'
import { formatDateTime, formatTimeAgo, getStatusBadgeClass, getStatusText } from '../utils/helpers'
import toast from 'react-hot-toast'
import CreateFoodModal from '../components/CreateFoodModal'
import FoodItemCard from '../components/FoodItemCard'
import PickupRequestCard from '../components/PickupRequestCard'
import TabNavigation from '../components/TabNavigation'
import DashboardHeader from '../components/DashboardHeader'

const DonorDashboard = () => {
  const [foodItems, setFoodItems] = useState([])
  const [pickupRequests, setPickupRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState('food-items')
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
        {/* Dashboard Header with Stats */}
        <DashboardHeader
          title="Donor Dashboard"
          subtitle="Manage your food donations and pickup requests"
          icon={Package}
          iconGradient="bg-gradient-to-r from-emerald-500 to-green-500"
          stats={[
            {
              label: 'Total Items',
              value: stats.total,
              icon: Package,
              iconBg: 'bg-gradient-to-r from-primary-500 to-blue-500',
              bgGradient: 'from-primary-50 to-blue-50'
            },
            {
              label: 'Available',
              value: stats.available,
              icon: Clock,
              iconBg: 'bg-gradient-to-r from-emerald-500 to-green-500',
              bgGradient: 'from-emerald-50 to-green-50'
            },
            {
              label: 'Completed',
              value: stats.completed,
              icon: CheckCircle,
              iconBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
              bgGradient: 'from-emerald-50 to-teal-50'
            }
          ]}
        />

        {/* Tab Navigation */}
        <div className="mb-8 animate-fade-in-up">
          <TabNavigation
            tabs={[
              {
                id: 'food-items',
                label: 'My Food Items',
                icon: Package,
                count: foodItems.length
              },
              {
                id: 'pickup-requests',
                label: 'Pickup Requests',
                icon: Clock,
                count: pickupRequests.length
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in-up">
          {activeTab === 'food-items' && (
            <div className="space-y-6">
              {/* Add Food Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">My Food Items</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  <span>Add Food Item</span>
                </button>
              </div>

              {/* Food Items Grid */}
              {foodItems.length === 0 ? (
                <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-12 text-center border border-gray-200">
                  <Package className="mx-auto h-20 w-20 text-gray-400 mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No food items yet</h3>
                  <p className="text-gray-600 mb-6">Get started by creating your first food donation and help reduce food waste in your community.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-lg mx-auto"
                  >
                    <Plus size={20} />
                    <span>Add Your First Food Item</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                  {foodItems.map((item) => (
                    <div key={item.id} className="h-full">
                      <FoodItemCard
                        item={item}
                        onStatusUpdate={handleStatusUpdate}
                        showActions={true}
                        type="donor"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pickup-requests' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Pickup Requests</h2>

              {pickupRequests.length === 0 ? (
                <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-12 text-center border border-gray-200">
                  <Clock className="mx-auto h-20 w-20 text-gray-400 mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No pickup requests</h3>
                  <p className="text-gray-600">Requests from beneficiaries will appear here when they're interested in your food donations.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pickupRequests.map((request) => (
                    <PickupRequestCard
                      key={request.id}
                      request={request}
                      onAction={handleRequestAction}
                      type="donor"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
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
