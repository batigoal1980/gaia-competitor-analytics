import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Eye, Heart, MessageCircle, Share2, Bookmark, DollarSign, Play, Copy, ExternalLink, ArrowLeft, Video, Hash, Pause, Clock, Tag, Target, Eye as EyeIcon } from 'lucide-react'
import { API_BASE_URL } from '../config'

const VideoPlayer = () => {
  const { id } = useParams()
  const [videoData, setVideoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingClips, setPlayingClips] = useState({})
  const clipRefs = useRef({})

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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleClipPlayPause = (clipId) => {
    const videoElement = clipRefs.current[clipId]
    if (videoElement) {
      if (playingClips[clipId]) {
        videoElement.pause()
        setPlayingClips(prev => ({ ...prev, [clipId]: false }))
      } else {
        // Pause all other clips first
        Object.keys(playingClips).forEach(id => {
          if (clipRefs.current[id]) {
            clipRefs.current[id].pause()
          }
        })
        setPlayingClips({ [clipId]: true })
        
        // Play the selected clip
        const playPromise = videoElement.play()
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error('Clip play error:', err)
            setPlayingClips(prev => ({ ...prev, [clipId]: false }))
          })
        }
      }
    }
  }

  const handleClipEnded = (clipId) => {
    setPlayingClips(prev => ({ ...prev, [clipId]: false }))
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimeRange = (start, end) => {
    if (!start || !end) return 'N/A'
    return `${formatDuration(start)} - ${formatDuration(end)}`
  }

  // Get the video URL with fallback
  const videoUrl = videoData?.wholeVideoUrl || videoData?.videoUrl

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
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <Link
          to="/"
          className="btn-secondary flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Video Player & Scripts (1/3 width) */}
        <div className="space-y-6">
          {/* Video Player */}
          <div className="card p-0 overflow-hidden">
            <div className="relative bg-black rounded-lg overflow-hidden">
              {videoUrl ? (
                <div className="w-full h-96 relative flex items-center justify-center">
                  {/* Main Video Player */}
                  <video
                    src={videoUrl}
                    className="max-w-full max-h-full object-contain"
                    controls={true}
                    loop
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Video Player</p>
                    <p className="text-sm text-gray-500 mt-2">No video available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video Info */}
          <div className="card">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Ad Type:</span>
                  <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {videoData.adType}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Total Clips:</span>
                  <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {videoData.totalClips}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Storyboard (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Full Storyboard Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Storyboard Breakdown</h3>
            </div>
            {/* Table-style storyboard: columns = clips, rows = features */}
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="w-32 text-sm font-medium text-gray-700 sticky left-0 bg-white z-10"></th>
                      {videoData.clips.map((clip, idx) => (
                        <th key={clip._id || idx} className="text-center w-48 min-w-48 max-w-48">
                          <video
                            src={clip.url}
                            controls
                            className="w-36 h-64 object-cover rounded mb-2 border"
                          />
                          <div className="text-sm text-gray-500">Clip {idx + 1}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Scene (contentCategory) */}
                    <tr>
                      <td className="text-sm font-medium text-gray-700 sticky left-0 bg-white z-10">Scene</td>
                      {videoData.clips.map((clip, idx) => (
                        <td key={clip._id || idx} className="text-left align-top text-sm w-48 min-w-48 max-w-48">
                          {clip.contentCategory || <span className="text-gray-400">N/A</span>}
                        </td>
                      ))}
                    </tr>
                    {/* Visual Content (visualDescription) */}
                    <tr>
                      <td className="text-sm font-medium text-gray-700 sticky left-0 bg-white z-10">Visual Content</td>
                      {videoData.clips.map((clip, idx) => (
                        <td key={clip._id || idx} className="text-left align-top text-sm w-48 min-w-48 max-w-48">
                          {clip.visualDescription || <span className="text-gray-400">N/A</span>}
                        </td>
                      ))}
                    </tr>
                    {/* All Clips Transcripts */}
                    <tr>
                      <td className="text-sm font-medium text-gray-700 sticky left-0 bg-white z-10">All Clips Transcripts</td>
                      {videoData.clips.map((clip, idx) => (
                        <td key={clip._id || idx} className="text-left align-top whitespace-pre-line text-sm w-48 min-w-48 max-w-48">
                          {clip.audioText || <span className="text-gray-400">N/A</span>}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer 