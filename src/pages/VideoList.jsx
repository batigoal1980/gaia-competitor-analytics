import { useState, useEffect } from 'react'
import { Search, Filter, Eye, Heart, Share2, DollarSign, Video } from 'lucide-react'
import VideoCard from '../components/VideoCard'
import { API_BASE_URL } from '../config'

const VideoList = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('Beauty & Personal Care')
  const [selectedTimeframe, setSelectedTimeframe] = useState('All time')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  const timeframes = ['7 days', '30 days', '90 days', 'All time']
  const industries = ['Beauty & Personal Care', 'Fashion', 'Technology', 'Food & Beverage']

  useEffect(() => {
    fetchAllVideos()
  }, [])

  const fetchAllVideos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos`)
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
      
      // Convert to array and sort by number of clips
      const videosArray = Object.values(groupedVideos).sort((a, b) => b.clips.length - a.clips.length)
      setVideos(videosArray)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching videos:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-1">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search videos..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button className="btn-secondary flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Video className="w-6 h-6 text-gray-500" />
          </div>
          <div className="metric-value">{videos.length}</div>
          <div className="metric-label">Total Videos</div>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Video className="w-6 h-6 text-gray-500" />
          </div>
          <div className="metric-value">{videos.reduce((total, video) => total + video.clips.length, 0)}</div>
          <div className="metric-label">Total Clips</div>
        </div>
      </div>

      {/* Video Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Videos</h2>
          <div className="text-sm text-gray-500">
            Showing {videos.length} videos
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="btn-primary">
          Load More Videos
        </button>
      </div>
    </div>
  )
}

export default VideoList 