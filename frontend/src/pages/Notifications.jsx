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
                return 'border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50'
            case 'pickup_request':
                return 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50'
            case 'request_accepted':
                return 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
            case 'request_rejected':
                return 'border-red-300 bg-gradient-to-r from-red-50 to-rose-50'
            case 'pickup_completed':
                return 'border-purple-300 bg-gradient-to-r from-purple-50 to-violet-50'
            default:
                return 'border-gray-300 bg-gradient-to-r from-gray-50 to-primary-50'
        }
    }

    const filteredNotifications = getFilteredNotifications()
    const unreadCount = notifications.filter(n => !n.is_read).length

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 border border-gray-200">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="spinner"></div>
                        <p className="text-gray-600 font-semibold">Loading notifications...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 transition-colors duration-700">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in-up">
                    <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 border border-gray-200 hover:border-primary-300 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Bell className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center">
                                        Notifications
                                        {unreadCount > 0 && (
                                            <span className="ml-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm rounded-full px-3 py-1 shadow-lg">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </h1>
                                    <p className="mt-2 text-gray-600">Stay updated with your food donations and requests</p>
                                </div>
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-lg flex items-center"
                                >
                                    <Check size={16} className="mr-2" />
                                    Mark All Read
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="mb-8 animate-fade-in-up">
                    <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-primary-300 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-3">
                                    <Filter size={16} className="text-primary-400" />
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium"
                                    >
                                        <option value="all">All Notifications</option>
                                        <option value="unread">Unread ({unreadCount})</option>
                                        <option value="read">Read ({notifications.length - unreadCount})</option>
                                    </select>
                                </div>

                                {filteredNotifications.length > 0 && (
                                    <button
                                        onClick={selectAllNotifications}
                                        className="text-sm text-primary-600 hover:text-primary-500 font-semibold px-3 py-2 rounded-lg hover:bg-primary-50 transition"
                                    >
                                        {filteredNotifications.every(n => selectedNotifications.includes(n.id))
                                            ? 'Deselect All'
                                            : 'Select All'
                                        }
                                    </button>
                                )}
                            </div>

                            {selectedNotifications.length > 0 && (
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg font-semibold">
                                        {selectedNotifications.length} selected
                                    </span>
                                    <button
                                        onClick={deleteSelectedNotifications}
                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md flex items-center"
                                    >
                                        <Trash2 size={14} className="mr-1" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4 animate-fade-in-up">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-12 border border-gray-200 text-center">
                            <Bell className="mx-auto h-16 w-16 text-gray-400" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                {filter === 'unread' ? 'No unread notifications' :
                                    filter === 'read' ? 'No read notifications' : 'No notifications'}
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
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
                                className={`bg-white bg-opacity-90 shadow-2xl rounded-2xl border hover:border-primary-300 transition-all duration-300 hover:shadow-xl cursor-pointer ${!notification.is_read ? 'ring-2 ring-primary-200' : ''
                                    } ${getNotificationColor(notification.type)}`}
                                onClick={() => !notification.is_read && markAsRead(notification.id)}
                            >
                                <div className="p-6">
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

                                        <div className="text-3xl">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className={`text-base font-bold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                                        }`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className={`mt-2 text-sm ${!notification.is_read ? 'text-gray-700' : 'text-gray-500'
                                                        }`}>
                                                        {notification.message}
                                                    </p>

                                                    {notification.payload && (
                                                        <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                                                            {notification.payload.distance && (
                                                                <span className="font-medium">Distance: {notification.payload.distance}</span>
                                                            )}
                                                            {notification.payload.beneficiary && (
                                                                <span className="font-medium">From: {notification.payload.beneficiary}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-3 ml-4">
                                                    {!notification.is_read && (
                                                        <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-violet-500 rounded-full shadow-lg"></div>
                                                    )}
                                                    <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
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
                    <div className="text-center mt-8 animate-fade-in-up">
                        <button className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg">
                            Load More Notifications
                        </button>
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
      `}</style>
        </div>
    )
}

export default Notifications