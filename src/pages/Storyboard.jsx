import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Play, Copy, ArrowLeft, Video, ExternalLink } from 'lucide-react'
import { API_BASE_URL } from '../config'

const Storyboard = () => {
  const { id } = useParams()
  const [videoData, setVideoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentClipIndex, setCurrentClipIndex] = useState(0)

  useEffect(() => {
    fetchVideoData()
  }, [id])

  const fetchVideoData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/whole-video/${encodeURIComponent(id)}`)
      if (!response.ok) {
        throw new Error('Video not found')
      }
      const data = await response.json()
      setVideoData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching video data:', error)
      setLoading(false)
    }
  }

  const handleClipChange = (index) => {
    setCurrentClipIndex(index)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!videoData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Video not found</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Video Player */}
      <div className="space-y-4">
        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          {videoData.clips && videoData.clips.length > 0 ? (
            <div className="w-full h-96 relative">
              {/* Main Video Player */}
              <video
                src={videoData.clips[currentClipIndex]?.url}
                className="w-full h-full object-cover"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ccircle cx='200' cy='150' r='40' fill='%238b5cf6'/%3E%3Cpolygon points='190,130 190,170 210,150' fill='white'/%3E%3C/svg%3E"
                controls={true}
                muted
                loop
              />
              
              {/* Clip Navigation */}
              {videoData.clips.length > 1 && (
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  {videoData.clips.map((clip, index) => (
                    <button
                      key={index}
                      onClick={() => handleClipChange(index)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        index === currentClipIndex 
                          ? 'bg-white text-black' 
                          : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
                      }`}
                    >
                      Clip {clip.sno || index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <p className="text-lg text-gray-600">Video Player</p>
                <p className="text-sm text-gray-500 mt-2">No clips available</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-gray-900">Ad Type: {videoData.adType}</span>
            </div>
            <p className="text-sm text-gray-600">
              {videoData.totalClips} clips • Current: Clip {videoData.clips[currentClipIndex]?.sno || currentClipIndex + 1}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center">
            <Copy className="w-4 h-4 mr-2" />
            Copy all transcripts
          </button>
        </div>
      </div>

      {/* Right Column - Clips Breakdown */}
      <div className="space-y-6">
        {/* Clips Header */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Video Clips Breakdown</h2>
            <button className="btn-primary flex items-center">
              <Copy className="w-4 h-4 mr-2" />
              Copy breakdown
            </button>
          </div>
        </div>

        {/* Clips Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header px-4 py-3 text-left">Clip #</th>
                  <th className="table-header px-4 py-3 text-left">Preview</th>
                  <th className="table-header px-4 py-3 text-left">Transcript</th>
                  <th className="table-header px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {videoData.clips.map((clip, index) => (
                  <tr key={clip._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">{clip.sno || index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative w-24 h-16 bg-gray-200 rounded overflow-hidden">
                        <video
                          src={clip.url}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute top-1 right-1">
                          <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                      {clip.audioText || 'No transcript available'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleClipChange(index)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Play
                        </button>
                        <button className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">
                          Copy
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation Back */}
        <div className="card">
          <Link
            to={`/video/${encodeURIComponent(videoData.wholeVideoUrl)}`}
            className="btn-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Video Analysis
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Storyboard 