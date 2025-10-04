import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Bell, User, LogOut, Menu, X, MapPin, Home } from 'lucide-react'
import { getRoleDisplayName, getInitials } from '../utils/helpers'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsProfileMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  if (!user) {
    return (
      <nav className="bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 shadow-lg border-b border-gray-300 transition-colors duration-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-16 w-auto rounded-lg shadow-md border-2 border-primary-300 bg-white"
                width={80}
                height={80}
              />
              <span className="text-2xl font-extrabold text-gray-900 tracking-wide">Food Surplus</span>
            </Link>
            <div className="flex items-center space-x-5">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-700 px-4 py-2 rounded-lg font-semibold transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-violet-500 text-white font-bold hover:from-primary-600 hover:to-violet-600 shadow-md transition duration-300"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-gradient-to-br from-primary-100 via-blue-100 to-violet-100 shadow-lg border-b border-gray-300 transition-colors duration-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between h-20 items-center">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-400/30 transition-transform duration-300 hover:scale-105">
              <span className="text-white font-extrabold text-lg select-none">FS</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-900 tracking-wide">Food Surplus</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {[
              { to: '/', icon: Home, label: 'Dashboard' },
              { to: '/map', icon: MapPin, label: 'Map' },
              { to: '/notifications', icon: Bell, label: 'Notifications' },
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition duration-300 ${isActive(to)
                    ? 'bg-primary-50 text-primary-700 shadow-inner'
                    : 'text-gray-700 hover:bg-primary-100 hover:text-primary-700'
                  }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg font-medium text-gray-700 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center shadow-md text-white font-semibold text-sm select-none">
                  {getInitials(user.name)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-base font-semibold">{user.name}</div>
                  <div className="text-xs text-primary-600">{getRoleDisplayName(user.role)}</div>
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg py-2 border border-gray-200 z-50 focus:outline-none animate-fade-in-up">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-5 py-3 text-gray-700 hover:bg-primary-50 rounded-lg transition"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-5 py-3 text-gray-700 hover:bg-primary-50 rounded-lg transition"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded-md p-2 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-xl shadow-lg border border-gray-200 py-4 animate-fade-in">
            {[
              { to: '/', icon: Home, label: 'Dashboard' },
              { to: '/map', icon: MapPin, label: 'Map' },
              { to: '/notifications', icon: Bell, label: 'Notifications' },
              { to: '/profile', icon: User, label: 'Profile' },
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center space-x-3 px-5 py-3 rounded-lg text-gray-700 font-medium text-base transition-colors duration-300 ${isActive(to) ? 'bg-primary-50 text-primary-700 shadow-inner' : 'hover:bg-primary-100'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogout()
                setIsMenuOpen(false)
              }}
              className="flex items-center space-x-3 px-5 py-3 w-full text-gray-700 font-medium hover:bg-primary-100 rounded-lg transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
            <div className="border-t border-gray-200 mt-4 pt-4 px-5 flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {getInitials(user.name)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-xs text-primary-600">{getRoleDisplayName(user.role)}</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Overlay and animation styles */}
      <style jsx="true" global="true">{`
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  )
}

export default Navbar
