import React from 'react'
import { Clock, User, MessageSquare, CheckCircle, XCircle, Package2, Package } from 'lucide-react'
import { formatDateTime, formatTimeAgo, getStatusBadgeClass, getStatusText } from '../utils/helpers'

const PickupRequestCard = ({ request, onAction, type = 'donor' }) => {
    const getActionButtons = () => {
        if (type === 'donor') {
            // Donor view - can accept/reject pending requests
            if (request.status === 'pending') {
                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onAction(request.id, 'accepted')}
                            className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md text-sm"
                        >
                            <CheckCircle size={14} />
                            <span>Accept</span>
                        </button>
                        <button
                            onClick={() => onAction(request.id, 'rejected')}
                            className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md text-sm"
                        >
                            <XCircle size={14} />
                            <span>Reject</span>
                        </button>
                    </div>
                )
            } else if (request.status === 'accepted') {
                return (
                    <button
                        onClick={() => onAction(request.id, 'picked')}
                        className="px-4 py-2 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-md text-sm"
                    >
                        Mark as Picked
                    </button>
                )
            } else if (request.status === 'picked') {
                return (
                    <button
                        onClick={() => onAction(request.id, 'completed')}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md text-sm"
                    >
                        Complete
                    </button>
                )
            }
        } else {
            // Beneficiary view - can cancel pending requests, mark as picked for accepted
            if (request.status === 'pending') {
                return (
                    <button
                        onClick={() => onAction(request.id, 'cancelled')}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md text-sm"
                    >
                        Cancel
                    </button>
                )
            } else if (request.status === 'accepted') {
                return (
                    <button
                        onClick={() => onAction(request.id, 'picked')}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md text-sm"
                    >
                        Mark Picked
                    </button>
                )
            }
        }
        return null
    }

    const getStatusMessage = () => {
        if (type === 'beneficiary') {
            if (request.status === 'accepted' && request.food_item) {
                return (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-sm text-emerald-800 font-semibold">
                            ✓ Request accepted! Pickup between {formatDateTime(request.food_item.pickup_start)} - {formatDateTime(request.food_item.pickup_end)}
                        </p>
                    </div>
                )
            } else if (request.status === 'rejected') {
                return (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800 font-semibold">
                            Request was rejected by the donor.
                        </p>
                    </div>
                )
            }
        }
        return null
    }

    return (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-hidden">
            {/* Food Item Image */}
            <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {request.food_item?.image_url ? (
                    <img
                        src={request.food_item.image_url}
                        alt={request.food_item.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            console.log('Image failed to load:', request.food_item.image_url)
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                        }}
                        onLoad={() => {
                            console.log('Image loaded successfully:', request.food_item.image_url)
                        }}
                    />
                ) : (
                    <div className="flex absolute inset-0 items-center justify-center bg-gradient-to-br from-primary-100 to-violet-100">
                        <Package size={40} className="text-primary-400" />
                    </div>
                )}
                <div className={`${request.food_item?.image_url ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-gradient-to-br from-primary-100 to-violet-100`}>
                    <Package size={40} className="text-primary-400" />
                </div>

                {/* Status Badge Overlay */}
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${getStatusBadgeClass(request.status)}`}>
                        {getStatusText(request.status)}
                    </span>
                </div>

                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>

            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        {/* Food Item Title */}
                        <div className="flex items-center space-x-2">
                            <Package2 size={18} className="text-primary-500 flex-shrink-0" />
                            <h4 className="text-lg font-bold text-gray-900 line-clamp-1">
                                {request.food_item?.title || 'Food Item'}
                            </h4>
                        </div>

                        {/* Requester/Donor Info */}
                        <div className="flex items-center space-x-2">
                            <User size={16} className="text-violet-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 font-semibold">
                                {type === 'donor'
                                    ? `Requested by: ${request.beneficiary_name}`
                                    : `From: ${request.food_item?.donor_name}`
                                }
                            </span>
                        </div>

                        {/* Message */}
                        {request.message && (
                            <div className="flex items-start space-x-2">
                                <MessageSquare size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-600 italic bg-gray-50 rounded-lg p-2 flex-1">
                                    "{request.message}"
                                </p>
                            </div>
                        )}

                        {/* Food Item Details */}
                        {request.food_item && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                <div className="flex items-center bg-primary-50 rounded-full px-3 py-1 border border-primary-200">
                                    <Package size={12} className="mr-1 text-primary-600" />
                                    <span className="text-xs font-semibold text-primary-700">
                                        {request.food_item.quantity} {request.food_item.unit}
                                    </span>
                                </div>
                                {request.food_item.location && (
                                    <div className="flex items-center bg-emerald-50 rounded-full px-3 py-1 border border-emerald-200">
                                        <span className="text-xs font-semibold text-emerald-700">
                                            {request.food_item.location}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Time and Status */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
                            <div className="flex items-center space-x-2">
                                <Clock size={14} className="text-gray-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 font-medium">
                                        {formatTimeAgo(request.requested_at)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {formatDateTime(request.requested_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {getStatusMessage()}
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-4 flex-shrink-0">
                        {getActionButtons()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PickupRequestCard