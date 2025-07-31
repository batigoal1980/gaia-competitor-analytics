import { useState, useEffect, useCallback } from 'react'
import { Eye, Heart, Share2, DollarSign, Video, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import VideoCard from '../components/VideoCard'
import { API_BASE_URL } from '../config'

const VideoList = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAllVideos()
  }, [])

  const fetchAllVideos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/videos`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      // Group clips by whole video URL
      const groupedVideos = data.reduce((acc, clip) => {
        const videoUrl = clip.videoInfo?.url || 'Unknown Video'
        if (!acc[videoUrl]) {
          acc[videoUrl] = {
            id: videoUrl,
            wholeVideoUrl: videoUrl,
            clips: [],
            adType: clip.analysis?.adType || 'Unknown'
          }
        }
        acc[videoUrl].clips.push(clip)
        return acc
      }, {})
      
      // Convert to array and sort by number of clips (smallest first)
      const videosArray = Object.values(groupedVideos).sort((a, b) => a.clips.length - b.clips.length)
      setVideos(videosArray)
    } catch (error) {
      console.error('Error fetching videos:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchAllVideos()
    setRefreshing(false)
  }, [fetchAllVideos])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <div className="text-lg text-gray-600">Loading videos...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <div className="text-lg text-red-600 mb-2">Error loading videos</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-primary flex items-center mx-auto"
          >
            {refreshing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Video Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Videos</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Showing {videos.length} videos
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary flex items-center"
            >
              {refreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
        
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2">No videos found</p>
            <p className="text-sm text-gray-500 mb-4">Try refreshing the page or check your connection</p>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-primary"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        )}
      </div>

      {/* Load More - Disabled for now since we're loading all videos */}
      {videos.length > 0 && (
        <div className="text-center">
          <button className="btn-primary" disabled>
            All Videos Loaded
          </button>
        </div>
      )}
    </div>
  )
}

export default VideoList 