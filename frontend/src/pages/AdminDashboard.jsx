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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage users, food items, and system operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Donors</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.donors}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Beneficiaries</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.beneficiaries}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Food Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalFood}</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{stats.completedPickups}</p>
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
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingVerifications}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Shield },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'food', name: 'Food Items', icon: Package },
              { id: 'verifications', name: 'Verifications', icon: CheckCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Food Items */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Food Items</h3>
              </div>
              <div className="card-content">
                <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                  {foodItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">By: {item.donor_name}</p>
                      </div>
                      <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Users</h3>
              </div>
              <div className="card-content">
                <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                        {user.verified && (
                          <CheckCircle size={14} className="text-success-600" />
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
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">All Users</h3>
            </div>
            <div className="card-content">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.verified ? (
                              <span className="badge-success">Verified</span>
                            ) : (
                              <span className="badge-warning">Unverified</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">All Food Items</h3>
            </div>
            <div className="card-content">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Food Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {foodItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.donor_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                            {getStatusText(item.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Verification Requests</h3>
            </div>
            <div className="card-content">
              {verificationRequests.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No verification requests</h3>
                  <p className="mt-1 text-sm text-gray-500">All verification requests have been processed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {verificationRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{request.user_name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Organization: {request.organization_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Type: {request.organization_type}
                          </p>
                          {request.description && (
                            <p className="text-sm text-gray-500 mt-2">{request.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-3">
                            <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                              {getStatusText(request.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Submitted: {formatDateTime(request.submitted_at)}
                            </span>
                          </div>
                          {request.document_url && (
                            <a
                              href={request.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:text-primary-500 mt-2 inline-block"
                            >
                              View Document
                            </a>
                          )}
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleVerificationAction(request.id, 'approved')}
                              className="btn-success btn-sm"
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerificationAction(request.id, 'rejected')}
                              className="btn-danger btn-sm"
                            >
                              <XCircle size={14} className="mr-1" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {request.admin_notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-600">
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
    </div>
  )
}

export default AdminDashboard
