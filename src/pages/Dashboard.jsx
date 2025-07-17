import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, TrendingUp, Medal, Eye, Heart, Share2, DollarSign, Video as VideoIcon, ChevronRight } from 'lucide-react'
import VideoCard from '../components/VideoCard'
import { API_BASE_URL } from '../config'

const Dashboard = () => {
  const [selectedFormat, setSelectedFormat] = useState(null)
  const [videoFormats, setVideoFormats] = useState([])
  const [sampleVideos, setSampleVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideoFormats()
  }, [])

  useEffect(() => {
    if (selectedFormat) {
      fetchVideosByFormat(selectedFormat.format)
    }
  }, [selectedFormat])

  const fetchVideoFormats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/video-formats`)
      const data = await response.json()
      
      // Add ranking and medals
      const formatsWithRanking = data.map((format, index) => ({
        ...format,
        id: index + 1,
        rank: index + 1,
        medal: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null
      }))
      
      setVideoFormats(formatsWithRanking)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching video formats:', error)
      setLoading(false)
    }
  }

  const fetchVideosByFormat = async (format) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/format/${encodeURIComponent(format)}`)
      const data = await response.json()
      
      // Data is already grouped by video, just need to format it for the frontend
      const videosArray = data.map(videoGroup => ({
        id: videoGroup.videoUrl,
        wholeVideoUrl: videoGroup.videoUrl,
        clips: videoGroup.clips,
        adType: format // Use the selected format as the dominant ad type
      }))
      
      setSampleVideos(videosArray)
    } catch (error) {
      console.error('Error fetching videos by format:', error)
    }
  }

  const getMedalIcon = (medal) => {
    if (medal === 'gold') return '🥇'
    if (medal === 'silver') return '🥈'
    if (medal === 'bronze') return '🥉'
    return null
  }

  const handleFormatClick = (format) => {
    setSelectedFormat(selectedFormat?.id === format.id ? null : format)
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
      {/* Video Formats Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header px-6 py-3 text-left">#</th>
                <th className="table-header px-6 py-3 text-left">Video Format</th>
                <th className="table-header px-6 py-3 text-left">
                  <div className="flex items-center">
                    Video Count
                    <VideoIcon className="w-4 h-4 ml-1" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videoFormats.map((format) => (
                <tr 
                  key={format.id} 
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedFormat?.id === format.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                  }`}
                  onClick={() => handleFormatClick(format)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getMedalIcon(format.medal) || format.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {format.format}
                      <ChevronRight className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                        selectedFormat?.id === format.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format.videoCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Animated Videos Section */}
      {selectedFormat && (
        <div className="mt-6 overflow-hidden">
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform transition-all duration-500 ease-in-out"
            style={{
              maxHeight: '800px',
              animation: 'slideDown 0.5s ease-out'
            }}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Videos - {selectedFormat.format}
                </h3>
                <button 
                  onClick={() => setSelectedFormat(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {sampleVideos.map((video) => (
                  <div key={video.id} className="flex-shrink-0 w-80">
                    <VideoCard video={video} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard 