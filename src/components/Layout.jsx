import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Video, Upload, Home } from 'lucide-react'

const Layout = ({ children }) => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Ad Format', icon: Home },
    { path: '/videos', label: 'Video Library', icon: Video },
    { path: '/analysis', label: 'Video Labeling', icon: Upload }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 pr-4 sm:pr-6 lg:pr-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ShowStop Creative Intelligence - GAIA Competitor Analysis</h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-8">
        {children}
      </main>
    </div>
  )
}

export default Layout 