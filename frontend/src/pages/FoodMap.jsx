import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { MapPin, Package, Clock, User, Navigation } from 'lucide-react'
import { foodAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { formatDateTime, formatDistance, getStatusBadgeClass, getStatusText } from '../utils/helpers'
import toast from 'react-hot-toast'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons for different types of markers
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

const foodIcon = createCustomIcon('#10b981') // green
const userIcon = createCustomIcon('#3b82f6') // blue

// Component to handle map centering
const MapController = ({ center, zoom }) => {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom)
    }
  }, [map, center, zoom])
  
  return null
}

const FoodMap = () => {
  const { user } = useAuth()
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFood, setSelectedFood] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]) // Default to NYC
  const [maxDistance, setMaxDistance] = useState(10)

  useEffect(() => {
    // Set user location if available
    if (user?.latitude && user?.longitude) {
      const location = [parseFloat(user.latitude), parseFloat(user.longitude)]
      setUserLocation(location)
      setMapCenter(location)
    }
    
    fetchFoodItems()
  }, [user, maxDistance])

  const fetchFoodItems = async () => {
    try {
      setLoading(true)
      const response = await foodAPI.getAll({ 
        status: 'available',
        max_distance: maxDistance 
      })
      
      // Filter items that have coordinates
      const itemsWithCoords = (response.data.food_items || []).filter(
        item => item.latitude && item.longitude
      )
      
      setFoodItems(itemsWithCoords)
    } catch (error) {
      console.error('Error fetching food items:', error)
      toast.error('Failed to load food items')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude]
          setUserLocation(location)
          setMapCenter(location)
          toast.success('Location updated!')
        },
        (error) => {
          console.error('Error getting location:', error)
          toast.error('Unable to get your location')
        }
      )
    } else {
      toast.error('Geolocation is not supported by this browser')
    }
  }

  const handleRequestPickup = async (foodItemId) => {
    try {
      // This would typically open a modal or redirect to request page
      // For now, we'll just show a success message
      toast.success('Pickup request feature would be implemented here')
    } catch (error) {
      console.error('Error requesting pickup:', error)
      toast.error('Failed to request pickup')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MapPin className="mr-3" />
            Food Map
          </h1>
          <p className="mt-2 text-gray-600">Find available food donations near you</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Max distance:</label>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="input w-auto"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Package size={16} />
              <span>{foodItems.length} items found</span>
            </div>
          </div>

          <button
            onClick={getCurrentLocation}
            className="btn-primary flex items-center"
          >
            <Navigation size={16} className="mr-2" />
            Use My Location
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-content p-0">
                {loading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '500px', width: '100%' }}
                    className="rounded-lg"
                  >
                    <MapController center={mapCenter} zoom={13} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* User location marker */}
                    {userLocation && (
                      <Marker position={userLocation} icon={userIcon}>
                        <Popup>
                          <div className="text-center">
                            <strong>Your Location</strong>
                            <br />
                            <span className="text-sm text-gray-600">
                              {user?.name || 'You are here'}
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Food item markers */}
                    {foodItems.map((item) => (
                      <Marker
                        key={item.id}
                        position={[parseFloat(item.latitude), parseFloat(item.longitude)]}
                        icon={foodIcon}
                        eventHandlers={{
                          click: () => setSelectedFood(item)
                        }}
                      >
                        <Popup>
                          <div className="min-w-64">
                            <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            
                            <div className="space-y-1 text-sm text-gray-500 mb-3">
                              <div className="flex items-center">
                                <Package size={12} className="mr-2" />
                                <span>{item.quantity} {item.unit}</span>
                              </div>
                              <div className="flex items-center">
                                <User size={12} className="mr-2" />
                                <span>{item.donor_name}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock size={12} className="mr-2" />
                                <span>{formatDateTime(item.pickup_start)}</span>
                              </div>
                              {item.distance && (
                                <div className="flex items-center">
                                  <MapPin size={12} className="mr-2" />
                                  <span>{formatDistance(item.distance)} away</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                                {getStatusText(item.status)}
                              </span>
                              
                              {user?.role === 'beneficiary' && item.status === 'available' && (
                                <button
                                  onClick={() => handleRequestPickup(item.id)}
                                  className="btn-primary btn-sm"
                                >
                                  Request
                                </button>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </div>
            </div>
          </div>

          {/* Food Items List */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Available Food Items</h3>
              </div>
              <div className="card-content">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="spinner"></div>
                  </div>
                ) : foodItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No food items</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No food donations are available in your area right now.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {foodItems.map((item) => (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedFood?.id === item.id
                            ? 'border-primary-300 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedFood(item)}
                      >
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>{item.quantity} {item.unit}</span>
                          <span>{item.donor_name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {item.distance ? formatDistance(item.distance) : 'Distance unknown'}
                          </span>
                          <span className={`badge badge-sm ${getStatusBadgeClass(item.status)}`}>
                            {getStatusText(item.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Food Details */}
            {selectedFood && (
              <div className="card mt-6">
                <div className="card-header">
                  <h3 className="card-title">Selected Item</h3>
                </div>
                <div className="card-content">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedFood.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedFood.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <p className="font-medium">{selectedFood.quantity} {selectedFood.unit}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Donor:</span>
                        <p className="font-medium">{selectedFood.donor_name}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 text-sm">Pickup Time:</span>
                      <p className="text-sm font-medium">
                        {formatDateTime(selectedFood.pickup_start)} - {formatDateTime(selectedFood.pickup_end)}
                      </p>
                    </div>
                    
                    {selectedFood.location && (
                      <div>
                        <span className="text-gray-500 text-sm">Location:</span>
                        <p className="text-sm font-medium">{selectedFood.location}</p>
                      </div>
                    )}
                    
                    {user?.role === 'beneficiary' && selectedFood.status === 'available' && (
                      <button
                        onClick={() => handleRequestPickup(selectedFood.id)}
                        className="btn-primary w-full mt-4"
                      >
                        Request Pickup
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FoodMap
