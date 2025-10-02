import React, { useState, useEffect } from 'react'
import { Bell, Check, Trash2, Filter } from 'lucide-react'
import { notificationAPI } from '../utils/api'
import { formatTimeAgo } from '../utils/helpers'
import toast from 'react-hot-toast'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState([])

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationAPI.getAll()
      setNotifications(response.data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      )
      toast.success('Notification marked as read')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read)
      await Promise.all(
        unreadNotifications.map(notification =>
          notificationAPI.markAsRead(notification.id)
        )
      )
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      )
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const selectAllNotifications = () => {
    const filteredNotifications = getFilteredNotifications()
    const allSelected = filteredNotifications.every(n => selectedNotifications.includes(n.id))
    
    if (allSelected) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  const deleteSelectedNotifications = async () => {
    // Note: This would require a delete endpoint in the API
    // For now, we'll just remove them from the local state
    setNotifications(prev =>
      prev.filter(notification => !selectedNotifications.includes(notification.id))
    )
    setSelectedNotifications([])
    toast.success('Selected notifications deleted')
  }

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.is_read)
      case 'read':
        return notifications.filter(n => n.is_read)
      default:
        return notifications
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_listing':
        return '🍽️'
      case 'pickup_request':
        return '📋'
      case 'request_accepted':
        return '✅'
      case 'request_rejected':
        return '❌'
      case 'pickup_completed':
        return '🎉'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_listing':
        return 'bg-blue-50 border-blue-200'
      case 'pickup_request':
        return 'bg-yellow-50 border-yellow-200'
      case 'request_accepted':
        return 'bg-green-50 border-green-200'
      case 'request_rejected':
        return 'bg-red-50 border-red-200'
      case 'pickup_completed':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="mr-3" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-sm rounded-full px-2 py-1">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="mt-2 text-gray-600">Stay updated with your food donations and requests</p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn-primary flex items-center"
              >
                <Check size={16} className="mr-2" />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input w-auto"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread ({unreadCount})</option>
                <option value="read">Read ({notifications.length - unreadCount})</option>
              </select>
            </div>
            
            {filteredNotifications.length > 0 && (
              <button
                onClick={selectAllNotifications}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {filteredNotifications.every(n => selectedNotifications.includes(n.id))
                  ? 'Deselect All'
                  : 'Select All'
                }
              </button>
            )}
          </div>

          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedNotifications.length} selected
              </span>
              <button
                onClick={deleteSelectedNotifications}
                className="btn-danger btn-sm flex items-center"
              >
                <Trash2 size={14} className="mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'read' ? 'No read notifications' : 'No notifications'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? 'You\'ll receive notifications about food donations and pickup requests here.'
                  : `Switch to "${filter === 'unread' ? 'read' : 'unread'}" to see other notifications.`
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`card cursor-pointer transition-all duration-200 hover:shadow-md ${
                  !notification.is_read ? 'ring-2 ring-primary-200' : ''
                } ${getNotificationColor(notification.type)}`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="card-content">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleNotificationSelection(notification.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`mt-1 text-sm ${
                            !notification.is_read ? 'text-gray-700' : 'text-gray-500'
                          }`}>
                            {notification.message}
                          </p>
                          
                          {notification.payload && (
                            <div className="mt-2 text-xs text-gray-500">
                              {notification.payload.distance && (
                                <span>Distance: {notification.payload.distance}</span>
                              )}
                              {notification.payload.beneficiary && (
                                <span>From: {notification.payload.beneficiary}</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          )}
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button (if pagination is implemented) */}
        {filteredNotifications.length > 0 && filteredNotifications.length % 20 === 0 && (
          <div className="text-center mt-8">
            <button className="btn-secondary">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
