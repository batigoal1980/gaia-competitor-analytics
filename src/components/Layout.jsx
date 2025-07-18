const Layout = ({ children }) => {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 pr-4 sm:pr-6 lg:pr-8">
          <div className="flex justify-start items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Meta Video Ad Creative Analytics - GAIA</h1>
            </div>
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