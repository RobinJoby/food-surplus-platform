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
        <div className="min-h-screen bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 transition-colors duration-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in-up">
                    <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 border border-gray-200 hover:border-primary-300 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                                <MapPin className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Food Map</h1>
                                <p className="mt-2 text-gray-600">Find available food donations near you</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="mb-8 animate-fade-in-up">
                    <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-6 border border-gray-200 hover:border-primary-300 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-3">
                                    <label className="text-sm font-semibold text-gray-700">Max distance:</label>
                                    <select
                                        value={maxDistance}
                                        onChange={(e) => setMaxDistance(Number(e.target.value))}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 hover:border-primary-300 transition font-medium"
                                    >
                                        <option value={5}>5 km</option>
                                        <option value={10}>10 km</option>
                                        <option value={20}>20 km</option>
                                        <option value={50}>50 km</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2 text-sm text-gray-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                                    <Package size={16} className="text-emerald-600" />
                                    <span className="font-semibold">{foodItems.length} items found</span>
                                </div>
                            </div>

                            <button
                                onClick={getCurrentLocation}
                                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-lg flex items-center"
                            >
                                <Navigation size={16} className="mr-2" />
                                Use My Location
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300 overflow-hidden">
                            <div className="p-0">
                                {loading ? (
                                    <div className="h-96 flex items-center justify-center bg-gradient-to-r from-primary-50 to-violet-50">
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="spinner"></div>
                                            <p className="text-gray-600 font-semibold">Loading map...</p>
                                        </div>
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
                        <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900">Available Food Items</h3>
                            </div>
                            <div className="p-6">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="spinner"></div>
                                            <p className="text-gray-600 font-semibold">Loading items...</p>
                                        </div>
                                    </div>
                                ) : foodItems.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="mx-auto h-16 w-16 text-gray-400" />
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No food items</h3>
                                        <p className="mt-2 text-sm text-gray-600">
                                            No food donations are available in your area right now.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                                        {foodItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`bg-gradient-to-r rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${selectedFood?.id === item.id
                                                        ? 'from-primary-50 to-violet-50 border-2 border-primary-300 shadow-lg'
                                                        : 'from-gray-50 to-primary-50 border border-gray-200 hover:border-primary-300'
                                                    }`}
                                                onClick={() => setSelectedFood(item)}
                                            >
                                                <h4 className="text-base font-bold text-gray-900 mb-2">
                                                    {item.title}
                                                </h4>
                                                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                                    {item.description}
                                                </p>

                                                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                                    <span className="font-semibold">{item.quantity} {item.unit}</span>
                                                    <span className="font-semibold">{item.donor_name}</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        {item.distance ? formatDistance(item.distance) : 'Distance unknown'}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(item.status)}`}>
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
                            <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300 mt-8">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900">Selected Item</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-primary-50 to-violet-50 rounded-xl p-4 border border-primary-200">
                                            <h4 className="font-bold text-gray-900 text-lg">{selectedFood.title}</h4>
                                            <p className="text-sm text-gray-700 mt-2">{selectedFood.description}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <span className="text-gray-500 font-medium">Quantity:</span>
                                                <p className="font-bold text-gray-900 mt-1">{selectedFood.quantity} {selectedFood.unit}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <span className="text-gray-500 font-medium">Donor:</span>
                                                <p className="font-bold text-gray-900 mt-1">{selectedFood.donor_name}</p>
                                            </div>
                                        </div>

                                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                            <span className="text-amber-700 font-medium text-sm">Pickup Time:</span>
                                            <p className="text-sm font-bold text-amber-900 mt-1">
                                                {formatDateTime(selectedFood.pickup_start)} - {formatDateTime(selectedFood.pickup_end)}
                                            </p>
                                        </div>

                                        {selectedFood.location && (
                                            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                                                <span className="text-emerald-700 font-medium text-sm">Location:</span>
                                                <p className="text-sm font-bold text-emerald-900 mt-1">{selectedFood.location}</p>
                                            </div>
                                        )}

                                        {user?.role === 'beneficiary' && selectedFood.status === 'available' && (
                                            <button
                                                onClick={() => handleRequestPickup(selectedFood.id)}
                                                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-violet-500 text-white font-bold rounded-lg hover:from-primary-600 hover:to-violet-600 transition-all duration-200 shadow-lg mt-6"
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

export default FoodMap