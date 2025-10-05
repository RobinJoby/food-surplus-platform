import React, { useState, useEffect } from 'react'
import { Users, Package, CheckCircle, XCircle, Clock, Shield } from 'lucide-react'
import { adminAPI, foodAPI, pickupAPI } from '../utils/api'
import { formatDateTime, getRoleDisplayName, getRoleBadgeClass, getStatusBadgeClass, getStatusText } from '../utils/helpers'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [pickupRequests, setPickupRequests] = useState([])
  const [verificationRequests, setVerificationRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    donors: 0,
    beneficiaries: 0,
    totalFood: 0,
    completedPickups: 0,
    pendingVerifications: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersResponse, foodResponse, requestsResponse, verificationResponse] = await Promise.all([
        adminAPI.getUsers(),
        foodAPI.getAll(),
        pickupAPI.getAll(),
        adminAPI.getVerificationRequests()
      ])

      setUsers(usersResponse.data.users || [])
      setFoodItems(foodResponse.data.food_items || [])
      setPickupRequests(requestsResponse.data.pickup_requests || [])
      setVerificationRequests(verificationResponse.data.verification_requests || [])

      // Calculate stats
      const usersList = usersResponse.data.users || []
      const foodList = foodResponse.data.food_items || []
      const requestsList = requestsResponse.data.pickup_requests || []
      const verificationsList = verificationResponse.data.verification_requests || []

      setStats({
        totalUsers: usersList.length,
        donors: usersList.filter(user => user.role === 'donor').length,
        beneficiaries: usersList.filter(user => user.role === 'beneficiary').length,
        totalFood: foodList.length,
        completedPickups: requestsList.filter(req => req.status === 'completed').length,
        pendingVerifications: verificationsList.filter(req => req.status === 'pending').length
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationAction = async (requestId, action, adminNotes = '') => {
    try {
      await adminAPI.updateVerificationRequest(requestId, {
        status: action,
        admin_notes: adminNotes
      })
      toast.success(`Verification ${action} successfully!`)
      fetchData()
    } catch (error) {
      console.error('Error updating verification:', error)
      toast.error(`Failed to ${action} verification`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 flex items-center justify-center">
        <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 border border-gray-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="spinner"></div>
            <p className="text-gray-600 font-semibold">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 border border-gray-200 hover:border-primary-300 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">Manage users, food items, and system operations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8 animate-fade-in-up">
          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-primary-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Total Users</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Donors</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.donors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-green-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Beneficiaries</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.beneficiaries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Food Items</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.totalFood}</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-emerald-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Completed</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.completedPickups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-amber-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Pending</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.pendingVerifications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 animate-fade-in-up">
          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-2 border border-gray-200 hover:border-primary-300 transition-all duration-300">
            <nav className="flex space-x-2">
              {[
                { id: 'overview', name: 'Overview', icon: Shield },
                { id: 'users', name: 'Users', icon: Users },
                { id: 'food', name: 'Food Items', icon: Package },
                { id: 'verifications', name: 'Verifications', icon: CheckCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-violet-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
            {/* Recent Food Items */}
            <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Recent Food Items</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                  {foodItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors duration-200">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-600">By: {item.donor_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Recent Users</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors duration-200">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                        {user.verified && (
                          <CheckCircle size={14} className="text-emerald-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300 animate-fade-in-up">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">All Users</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-primary-50 to-violet-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-primary-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(user.role)}`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.verified ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Verified</span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Unverified</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDateTime(user.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'food' && (
          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300 animate-fade-in-up">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">All Food Items</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-primary-50 to-violet-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Food Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {foodItems.map((item) => (
                      <tr key={item.id} className="hover:bg-primary-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.donor_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(item.status)}`}>
                            {getStatusText(item.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDateTime(item.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verifications' && (
          <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300 animate-fade-in-up">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Verification Requests</h3>
            </div>
            <div className="p-6">
              {verificationRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">No verification requests</h3>
                  <p className="mt-2 text-sm text-gray-600">All verification requests have been processed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {verificationRequests.map((request) => (
                    <div key={request.id} className="bg-gradient-to-r from-gray-50 to-primary-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900">{request.user_name}</h4>
                          <p className="text-sm text-gray-700 mt-1 font-semibold">
                            Organization: {request.organization_name}
                          </p>
                          <p className="text-sm text-gray-700 font-semibold">
                            Type: {request.organization_type}
                          </p>
                          {request.description && (
                            <p className="text-sm text-gray-600 mt-2">{request.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(request.status)}`}>
                              {getStatusText(request.status)}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              Submitted: {formatDateTime(request.submitted_at)}
                            </span>
                          </div>
                          {request.document_url && (
                            <a
                              href={request.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block font-semibold underline"
                            >
                              View Document
                            </a>
                          )}
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex space-x-3 ml-4">
                            <button
                              onClick={() => handleVerificationAction(request.id, 'approved')}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md"
                            >
                              <CheckCircle size={16} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleVerificationAction(request.id, 'rejected')}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md"
                            >
                              <XCircle size={16} />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {request.admin_notes && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Admin Notes:</strong> {request.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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

export default AdminDashboard
