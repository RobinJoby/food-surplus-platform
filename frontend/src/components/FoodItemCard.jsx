import React from 'react'
import { MapPin, Clock, Package, User } from 'lucide-react'
import { formatDateTime, formatDistance, getStatusBadgeClass, getStatusText } from '../utils/helpers'

const FoodItemCard = ({ item, onStatusUpdate, showActions = false }) => {
  const handleStatusChange = (newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(item.id, newStatus)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Food Image */}
          {item.image_url && (
            <div className="mb-3">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-32 object-cover rounded-md"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Title and Description */}
          <h4 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h4>
          {item.description && (
            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <div className="flex items-center text-sm text-gray-500">
              <Package size={14} className="mr-2" />
              <span>{item.quantity} {item.unit}</span>
            </div>

            {item.donor_name && (
              <div className="flex items-center text-sm text-gray-500">
                <User size={14} className="mr-2" />
                <span>{item.donor_name}</span>
              </div>
            )}

            {item.distance !== undefined && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin size={14} className="mr-2" />
                <span>{formatDistance(item.distance)} away</span>
              </div>
            )}

            {item.location && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin size={14} className="mr-2" />
                <span>{item.location}</span>
              </div>
            )}
          </div>

          {/* Pickup Time */}
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Clock size={14} className="mr-2" />
            <span>
              Pickup: {formatDateTime(item.pickup_start)} - {formatDateTime(item.pickup_end)}
            </span>
          </div>

          {/* Expiry Date */}
          {item.expiry_date && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <Clock size={14} className="mr-2" />
              <span>Expires: {formatDateTime(item.expiry_date)}</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`badge ${getStatusBadgeClass(item.status)}`}>
              {getStatusText(item.status)}
            </span>
            
            <span className="text-xs text-gray-400">
              Created {formatDateTime(item.created_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="ml-4 flex flex-col space-y-2">
            {item.status === 'available' && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="btn-danger btn-sm"
              >
                Cancel
              </button>
            )}
            
            {item.status === 'requested' && (
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-500 text-center">Pending requests</span>
              </div>
            )}
            
            {item.status === 'accepted' && (
              <button
                onClick={() => handleStatusChange('picked')}
                className="btn-primary btn-sm"
              >
                Mark Picked
              </button>
            )}
            
            {item.status === 'picked' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="btn-success btn-sm"
              >
                Complete
              </button>
            )}
            
            {(item.status === 'completed' || item.status === 'cancelled') && (
              <span className="text-xs text-gray-500 text-center">
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
