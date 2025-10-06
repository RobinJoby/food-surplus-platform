import React from 'react'
import { MapPin, Clock, Package, User, Edit, Eye, Tag } from 'lucide-react'
import { formatDateTime, formatUTCDateTime, formatDistance, getStatusBadgeClass, getStatusText } from '../utils/helpers'

const FoodItemCard = ({ item, onStatusUpdate, onRequestPickup, showActions = false, type = 'donor' }) => {
  const handleStatusChange = (newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(item.id, newStatus)
    }
  }

  const handleRequestPickup = () => {
    if (onRequestPickup) {
      onRequestPickup(item.id)
    }
  }

  const getActionButtons = () => {
    if (type === 'beneficiary') {
      return (
        <button
          onClick={handleRequestPickup}
          className="w-full px-4 py-2 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-md text-sm"
        >
          Request Pickup
        </button>
      )
    }

    if (!showActions) return null

    return (
      <div className="flex flex-col space-y-2">
        {item.status === 'available' && (
          <>
            <button
              onClick={() => handleStatusChange('cancelled')}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md text-sm"
            >
              <span>Cancel</span>
            </button>
          </>
        )}

        {item.status === 'requested' && (
          <div className="text-center">
            <span className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 font-semibold">
              Pending Requests
            </span>
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
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden flex flex-col h-full">
      {/* Food Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              console.log('Image failed to load:', item.image_url)
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', item.image_url)
            }}
          />
        ) : (
          <div className="flex absolute inset-0 items-center justify-center bg-gradient-to-br from-primary-100 to-violet-100">
            <Package size={48} className="text-primary-400" />
          </div>
        )}
        <div className={`${item.image_url ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-gradient-to-br from-primary-100 to-violet-100`}>
          <Package size={48} className="text-primary-400" />
        </div>

        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${getStatusBadgeClass(item.status)}`}>
            {getStatusText(item.status)}
          </span>
        </div>

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Card Content - Flexible */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Main Content - Grows to fill space */}
        <div className="flex-grow">
          {/* Title and Description */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
            )}
          </div>

          {/* Tags Section */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center bg-primary-50 rounded-full px-3 py-1 border border-primary-200">
              <Package size={14} className="mr-1 text-primary-600" />
              <span className="text-xs font-semibold text-primary-700">{item.quantity} {item.unit}</span>
            </div>

            {item.donor_name && (
              <div className="flex items-center bg-violet-50 rounded-full px-3 py-1 border border-violet-200">
                <User size={14} className="mr-1 text-violet-600" />
                <span className="text-xs font-semibold text-violet-700">{item.donor_name}</span>
              </div>
            )}

            {item.distance !== undefined && (
              <div className="flex items-center bg-emerald-50 rounded-full px-3 py-1 border border-emerald-200">
                <MapPin size={14} className="mr-1 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">{formatDistance(item.distance)} away</span>
              </div>
            )}
          </div>

          {/* Location */}
          {item.location && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <MapPin size={16} className="mr-2 text-gray-400" />
              <span className="font-medium">{item.location}</span>
            </div>
          )}

          {/* Pickup Time */}
          <div className="bg-amber-50 rounded-lg p-3 mb-3 border border-amber-200">
            <div className="flex items-center text-sm text-amber-800">
              <Clock size={16} className="mr-2 text-amber-600" />
              <div className="flex flex-col">
                <span className="font-semibold">Pickup Window</span>
                <span className="text-xs font-medium">
                  {formatDateTime(item.pickup_start)} - {formatDateTime(item.pickup_end)}
                </span>
              </div>
            </div>
          </div>

          {/* Expiry Date */}
          {item.expiry_date && (
            <div className="bg-red-50 rounded-lg p-3 mb-4 border border-red-200">
              <div className="flex items-center text-sm text-red-800">
                <Clock size={16} className="mr-2 text-red-600" />
                <div className="flex flex-col">
                  <span className="font-semibold">Expires</span>
                  <span className="text-xs font-medium">{formatDateTime(item.expiry_date)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer and Action Buttons - Fixed at Bottom */}
        <div className="flex-shrink-0 mt-auto">
          {/* Footer */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
              Created: {formatDateTime(item.created_at)}
            </span>
          </div>

          {/* Action Buttons */}
          {getActionButtons()}
        </div>
      </div>
    </div>
  )
}

export default FoodItemCard