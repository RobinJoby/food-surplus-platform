import React, { useState, useEffect } from 'react'
import { MapPin, Clock, Package, CheckCircle, Search, Filter } from 'lucide-react'
import { foodAPI, pickupAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { formatDateTime, formatDistance, getStatusBadgeClass, getStatusText } from '../utils/helpers'
import toast from 'react-hot-toast'
import FoodItemCard from '../components/FoodItemCard'
import PickupRequestCard from '../components/PickupRequestCard'
import TabNavigation from '../components/TabNavigation'
import DashboardHeader from '../components/DashboardHeader'

const BeneficiaryDashboard = () => {
  const { user } = useAuth()
  const [availableFood, setAvailableFood] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [maxDistance, setMaxDistance] = useState(10)
  const [activeTab, setActiveTab] = useState('available-food')
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
        {/* Dashboard Header with Stats */}
        <DashboardHeader
          title="Beneficiary Dashboard"
          subtitle="Find and request food donations near you"
          icon={MapPin}
          iconGradient="bg-gradient-to-r from-blue-500 to-cyan-500"
          stats={[
            {
              label: 'Available Nearby',
              value: stats.available,
              icon: Package,
              iconBg: 'bg-gradient-to-r from-primary-500 to-blue-500',
              bgGradient: 'from-primary-50 to-blue-50'
            },
            {
              label: 'Pending Requests',
              value: stats.requested,
              icon: Clock,
              iconBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
              bgGradient: 'from-amber-50 to-orange-50'
            },
            {
              label: 'Accepted',
              value: stats.accepted,
              icon: CheckCircle,
              iconBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
              bgGradient: 'from-green-50 to-emerald-50'
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
                id: 'available-food',
                label: 'Available Food Near You',
                icon: Package,
                count: filteredFood.length
              },
              {
                id: 'my-requests',
                label: 'My Pickup Requests',
                icon: Clock,
                count: myRequests.length
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in-up">
          {activeTab === 'available-food' && (
            <div className="space-y-6">
              {/* Search and Filter Controls */}
              <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-primary-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search for food items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition text-sm font-medium"
                    />
                  </div>

                  <div className="flex items-center space-x-3 lg:flex-shrink-0">
                    <Filter className="h-5 w-5 text-primary-400" />
                    <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Max distance:</label>
                    <select
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(Number(e.target.value))}
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition text-sm font-medium"
                    >
                      <option value={5}>5 km</option>
                      <option value={10}>10 km</option>
                      <option value={20}>20 km</option>
                      <option value={50}>50 km</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Available Food Grid */}
              {filteredFood.length === 0 ? (
                <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-12 text-center border border-gray-200">
                  <Package className="mx-auto h-20 w-20 text-gray-400 mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {searchTerm ? 'No matching food items' : 'No food available nearby'}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? 'Try adjusting your search terms or increasing the distance filter.'
                      : 'No food donations are available in your area right now. Check back later or increase your search distance.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                  {filteredFood.map((item) => (
                    <div key={item.id} className="h-full">
                      <FoodItemCard
                        item={item}
                        onRequestPickup={handleRequestPickup}
                        showActions={false}
                        type="beneficiary"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-requests' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">My Pickup Requests</h2>

              {myRequests.length === 0 ? (
                <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-12 text-center border border-gray-200">
                  <Clock className="mx-auto h-20 w-20 text-gray-400 mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No pickup requests yet</h3>
                  <p className="text-gray-600">Your pickup requests will appear here when you request food items from donors.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myRequests.map((request) => (
                    <PickupRequestCard
                      key={request.id}
                      request={request}
                      onAction={handleRequestAction}
                      type="beneficiary"
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
    </div>
  )
}

export default BeneficiaryDashboard
