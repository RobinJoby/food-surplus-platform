import React from 'react'
import { MapPin, Clock, Package, User } from 'lucide-react'
import { formatDateTime, formatUTCDateTime, formatDistance, getStatusBadgeClass, getStatusText } from '../utils/helpers'

const FoodItemCard = ({ item, onStatusUpdate, showActions = false }) => {
  const handleStatusChange = (newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(item.id, newStatus)
    }
  }

  return (
    <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Food Image */}
          {item.image_url && (
            <div className="mb-4">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-40 object-cover rounded-xl shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Title and Description */}
          <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
          {item.description && (
            <p className="text-sm text-gray-700 mb-4 line-clamp-2">{item.description}</p>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
              <Package size={16} className="mr-2 text-primary-500" />
              <span className="font-semibold">{item.quantity} {item.unit}</span>
            </div>

            {item.donor_name && (
              <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                <User size={16} className="mr-2 text-violet-500" />
                <span className="font-semibold">{item.donor_name}</span>
              </div>
            )}

            {item.distance !== undefined && (
              <div className="flex items-center text-sm text-gray-600 bg-emerald-50 rounded-lg p-2">
                <MapPin size={16} className="mr-2 text-emerald-500" />
                <span className="font-semibold">{formatDistance(item.distance)} away</span>
              </div>
            )}

            {item.location && (
              <div className="flex items-center text-sm text-gray-600 bg-emerald-50 rounded-lg p-2">
                <MapPin size={16} className="mr-2 text-emerald-500" />
                <span className="font-semibold">{item.location}</span>
              </div>
            )}
          </div>

          {/* Pickup Time */}
          <div className="bg-amber-50 rounded-lg p-3 mb-3 border border-amber-200">
            <div className="flex items-center text-sm text-amber-800">
              <Clock size={16} className="mr-2 text-amber-600" />
              <span className="font-semibold">
                Pickup: {formatDateTime(item.pickup_start)} - {formatDateTime(item.pickup_end)}
              </span>
            </div>
          </div>

          {/* Expiry Date */}
          {item.expiry_date && (
            <div className="bg-red-50 rounded-lg p-3 mb-3 border border-red-200">
              <div className="flex items-center text-sm text-red-800">
                <Clock size={16} className="mr-2 text-red-600" />
                <span className="font-semibold">Expires: {formatDateTime(item.expiry_date)}</span>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusBadgeClass(item.status)}`}>
              {getStatusText(item.status)}
            </span>

            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-lg">
              Created: {formatDateTime(item.created_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="ml-6 flex flex-col space-y-3">
            {item.status === 'available' && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md text-sm"
              >
                Cancel
              </button>
            )}

            {item.status === 'requested' && (
              <div className="flex flex-col space-y-2">
                <span className="text-xs text-gray-600 text-center bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200 font-semibold">Pending requests</span>
              </div>
            )}

            {item.status === 'accepted' && (
              <button
                onClick={() => handleStatusChange('picked')}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-md text-sm"
              >
                Mark Picked
              </button>
            )}

            {item.status === 'picked' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md text-sm"
              >
                Complete
              </button>
            )}

            {(item.status === 'completed' || item.status === 'cancelled') && (
              <span className={`text-xs text-center px-3 py-2 rounded-lg font-semibold ${item.status === 'completed'
                ? 'text-green-700 bg-green-50 border border-green-200'
                : 'text-gray-600 bg-gray-50 border border-gray-200'
                }`}>
                {item.status === 'completed' ? 'Completed' : 'Cancelled'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FoodItemCard