import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Eye, Heart, MessageCircle, Share2, Bookmark, DollarSign, Play, Copy, ExternalLink, ArrowLeft, Video, Hash, Pause, Clock, Tag, Target, Eye as EyeIcon } from 'lucide-react'
import { API_BASE_URL } from '../config'

// Global video management system (same as VideoCard)
const VIDEO_EVENTS = {
  PLAY: 'video-play',
  PAUSE: 'video-pause'
}

// Custom event dispatcher
const dispatchVideoEvent = (eventType, videoId) => {
  console.log(`🎬 Dispatching ${eventType} event for video: ${videoId}`)
  window.dispatchEvent(new CustomEvent(eventType, { detail: { videoId } }))
}

const VideoPlayer = () => {
  const { id } = useParams()
  const [videoData, setVideoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingClips, setPlayingClips] = useState({})
  const [error, setError] = useState(null)
  const clipRefs = useRef({})
  const mainVideoRef = useRef(null)

  // Generate unique IDs for videos
  const mainVideoId = `main-${id}`
  const getClipVideoId = (clipId) => `clip-${id}-${clipId}`

  useEffect(() => {
    if (id) {
      setLoading(true)
      setError(null)
      fetchVideoData()
    }
  }, [id])

  // Global video event listeners for main video
  useEffect(() => {
    const handleVideoPlay = (event) => {
      const { videoId: playingVideoId } = event.detail
      console.log(`🎬 Main video received PLAY event from: ${playingVideoId}`)
      
      // If another video started playing, pause this main video
      if (playingVideoId !== mainVideoId && isPlaying) {
        console.log(`🎬 Pausing main video due to ${playingVideoId} playing`)
        if (mainVideoRef.current) {
          mainVideoRef.current.pause()
        }
        setIsPlaying(false)
      }
      
      // If a clip from this video started playing, pause the main video
      if (playingVideoId.startsWith(`clip-${id}`) && isPlaying) {
        console.log(`🎬 Pausing main video due to clip ${playingVideoId} playing`)
        if (mainVideoRef.current) {
          mainVideoRef.current.pause()
        }
        setIsPlaying(false)
      }
    }

    const handleVideoPause = (event) => {
      const { videoId: pausedVideoId } = event.detail
      console.log(`🎬 Main video received PAUSE event from: ${pausedVideoId}`)
      // If this main video was paused by another video, update state
      if (pausedVideoId === mainVideoId && isPlaying) {
        setIsPlaying(false)
      }
    }

    // Listen for global video events
    window.addEventListener(VIDEO_EVENTS.PLAY, handleVideoPlay)
    window.addEventListener(VIDEO_EVENTS.PAUSE, handleVideoPause)

    return () => {
      window.removeEventListener(VIDEO_EVENTS.PLAY, handleVideoPlay)
      window.removeEventListener(VIDEO_EVENTS.PAUSE, handleVideoPause)
    }
  }, [mainVideoId, isPlaying, id])

  // Global video event listeners for clip videos
  useEffect(() => {
    const handleClipVideoPlay = (event) => {
      const { videoId: playingVideoId } = event.detail
      console.log(`🎬 Clip videos received PLAY event from: ${playingVideoId}`)
      // If another video started playing, pause all clip videos
      const isAnyClipPlaying = Object.values(playingClips).some(playing => playing)
      if (isAnyClipPlaying && !playingVideoId.startsWith(`clip-${id}`)) {
        console.log(`🎬 Pausing all clip videos due to ${playingVideoId} playing`)
        Object.keys(playingClips).forEach(clipId => {
          if (playingClips[clipId] && clipRefs.current[clipId]) {
            clipRefs.current[clipId].pause()
          }
        })
        setPlayingClips({})
      }
    }

    const handleClipVideoPause = (event) => {
      const { videoId: pausedVideoId } = event.detail
      console.log(`🎬 Clip videos received PAUSE event from: ${pausedVideoId}`)
      // If a clip video was paused by another video, update state
      if (pausedVideoId.startsWith(`clip-${id}`)) {
        const clipId = pausedVideoId.split('-').pop()
        if (playingClips[clipId]) {
          setPlayingClips(prev => ({ ...prev, [clipId]: false }))
        }
      }
    }

    // Listen for global video events
    window.addEventListener(VIDEO_EVENTS.PLAY, handleClipVideoPlay)
    window.addEventListener(VIDEO_EVENTS.PAUSE, handleClipVideoPause)

    return () => {
      window.removeEventListener(VIDEO_EVENTS.PLAY, handleClipVideoPlay)
      window.removeEventListener(VIDEO_EVENTS.PAUSE, handleClipVideoPause)
    }
  }, [id, playingClips])

  // Direct main video pause listener
  useEffect(() => {
    const handleMainVideoPause = (event) => {
      const { videoId: playingVideoId } = event.detail
      // If any clip from this video starts playing, pause the main video
      if (playingVideoId.startsWith(`clip-${id}`) && mainVideoRef.current && isPlaying) {
        console.log(`🎬 Direct pause: Pausing main video due to clip ${playingVideoId}`)
        mainVideoRef.current.pause()
        setIsPlaying(false)
      }
    }

    window.addEventListener(VIDEO_EVENTS.PLAY, handleMainVideoPause)
    
    return () => {
      window.removeEventListener(VIDEO_EVENTS.PLAY, handleMainVideoPause)
    }
  }, [id, isPlaying])

  const fetchVideoData = async () => {
    try {
      console.log('Fetching video data for ID:', id)
      const response = await fetch(`${API_BASE_URL}/api/videos/whole-video/${encodeURIComponent(id)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Video data received:', data)
      setVideoData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching video data:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  const handlePlayPause = useCallback(() => {
    if (mainVideoRef.current) {
      if (isPlaying) {
        // Pause main video
        mainVideoRef.current.pause()
        dispatchVideoEvent(VIDEO_EVENTS.PAUSE, mainVideoId)
      } else {
        // Notify other videos to pause
        dispatchVideoEvent(VIDEO_EVENTS.PLAY, mainVideoId)
        
        // Pause all clip videos first
        Object.keys(playingClips).forEach(clipId => {
          if (clipRefs.current[clipId]) {
            clipRefs.current[clipId].pause()
          }
        })
        setPlayingClips({})
        
        // Play the main video
        mainVideoRef.current.play()
      }
    }
  }, [isPlaying, mainVideoId, playingClips])

  const handleClipPlayPause = useCallback((clipId) => {
    const videoElement = clipRefs.current[clipId]
    if (videoElement) {
      const clipVideoId = getClipVideoId(clipId)
      
      if (playingClips[clipId]) {
        // Pause this clip
        videoElement.pause()
        dispatchVideoEvent(VIDEO_EVENTS.PAUSE, clipVideoId)
        setPlayingClips(prev => ({ ...prev, [clipId]: false }))
      } else {
        // Notify other videos to pause
        dispatchVideoEvent(VIDEO_EVENTS.PLAY, clipVideoId)
        
        // Pause main video first
        if (mainVideoRef.current && isPlaying) {
          mainVideoRef.current.pause()
          setIsPlaying(false)
        }
        
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
  }, [playingClips, isPlaying])

  const handleClipEnded = useCallback((clipId) => {
    setPlayingClips(prev => ({ ...prev, [clipId]: false }))
  }, [])

  const handleMainVideoPlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handleMainVideoPause = useCallback(() => {
    setIsPlaying(false)
  }, [])

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
        <div className="text-lg text-gray-600">Loading video...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">Error loading video</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          <Link to="/videos" className="btn-primary">
            Back to Videos
          </Link>
        </div>
      </div>
    )
  }

  if (!videoData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Video not found</div>
          <Link to="/videos" className="btn-primary">
            Back to Videos
          </Link>
        </div>
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
          Back to Home
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
                    ref={mainVideoRef}
                    src={videoUrl}
                    className="max-w-full max-h-full object-contain"
                    controls={true}
                    loop
                    preload="metadata"
                    playsInline
                    onPlay={handleMainVideoPlay}
                    onPause={handleMainVideoPause}
                    onError={(e) => console.error('Main video error:', e)}
                    onLoadedData={() => console.log('Main video loaded')}
                    onTouchStart={(e) => {
                      // Prevent default touch behavior that might interfere with video
                      e.preventDefault()
                    }}
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
                            ref={(el) => {
                              if (el) clipRefs.current[clip._id || idx] = el
                            }}
                            src={clip.url}
                            controls
                            className="w-36 h-64 object-cover rounded mb-2 border"
                            onPlay={() => {
                              const clipId = clip._id || idx
                              const clipVideoId = getClipVideoId(clipId)
                              console.log(`🎬 Clip ${clipId} started playing, dispatching PLAY event`)
                              dispatchVideoEvent(VIDEO_EVENTS.PLAY, clipVideoId)
                              
                              // Pause main video first
                              if (mainVideoRef.current && isPlaying) {
                                console.log(`🎬 Pausing main video due to clip ${clipId} playing`)
                                mainVideoRef.current.pause()
                                setIsPlaying(false)
                              }
                              
                              // Pause all other clips first
                              Object.keys(playingClips).forEach(id => {
                                if (clipRefs.current[id] && id !== clipId) {
                                  console.log(`🎬 Pausing clip ${id} due to clip ${clipId} playing`)
                                  clipRefs.current[id].pause()
                                }
                              })
                              setPlayingClips({ [clipId]: true })
                            }}
                            onPause={() => {
                              const clipId = clip._id || idx
                              const clipVideoId = getClipVideoId(clipId)
                              dispatchVideoEvent(VIDEO_EVENTS.PAUSE, clipVideoId)
                              setPlayingClips(prev => ({ ...prev, [clipId]: false }))
                            }}
                            onEnded={() => handleClipEnded(clip._id || idx)}
                            onError={(e) => console.error('Clip video error:', e)}
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