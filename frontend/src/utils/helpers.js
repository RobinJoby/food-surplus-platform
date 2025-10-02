import { format, formatDistanceToNow, parseISO } from 'date-fns'

// Date formatting utilities
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy')
  } catch (error) {
    return 'Invalid date'
  }
}

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm')
  } catch (error) {
    return 'Invalid date'
  }
}

export const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
  } catch (error) {
    return 'Invalid date'
  }
}

// Status badge utilities
export const getStatusBadgeClass = (status) => {
  const statusClasses = {
    available: 'badge-success',
    requested: 'badge-warning',
    accepted: 'badge-primary',
    picked: 'badge-warning',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
  }
  return statusClasses[status] || 'badge-secondary'
}

export const getStatusText = (status) => {
  const statusTexts = {
    available: 'Available',
    requested: 'Requested',
    accepted: 'Accepted',
    picked: 'Picked Up',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return statusTexts[status] || status
}

// Distance formatting
export const formatDistance = (distance) => {
  if (distance === undefined || distance === null) return 'N/A'
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

// Role formatting
export const getRoleDisplayName = (role) => {
  const roleNames = {
    donor: 'Donor',
    beneficiary: 'Beneficiary',
    admin: 'Administrator',
  }
  return roleNames[role] || role
}

export const getRoleBadgeClass = (role) => {
  const roleClasses = {
    donor: 'badge-primary',
    beneficiary: 'badge-success',
    admin: 'badge-danger',
  }
  return roleClasses[role] || 'badge-secondary'
}

// Form validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

// Local storage utilities
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage:`, error)
    return defaultValue
  }
}

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage:`, error)
  }
}

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage:`, error)
  }
}

// Debounce utility
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Truncate text utility
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Generate avatar initials
export const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate random color for avatars
export const getRandomColor = (seed) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ]
  const index = seed ? seed.charCodeAt(0) % colors.length : Math.floor(Math.random() * colors.length)
  return colors[index]
}
