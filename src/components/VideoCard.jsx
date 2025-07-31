import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Heart, Share2, DollarSign, Play, Video, Hash, Pause, Loader2, Tag } from 'lucide-react'

// Global video management system
const VIDEO_EVENTS = {
  PLAY: 'video-play',
  PAUSE: 'video-pause'
}

// Custom event dispatcher
const dispatchVideoEvent = (eventType, videoId) => {
  console.log(`🎬 VideoCard dispatching ${eventType} event for video: ${videoId}`)
  window.dispatchEvent(new CustomEvent(eventType, { detail: { videoId } }))
}

const VideoCard = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const videoRef = useRef(null)
  const cardRef = useRef(null)
  const navigate = useNavigate()

  // Get the video URL with fallback
  const videoUrl = video.wholeVideoUrl || video.videoUrl
  const videoId = video.id || videoUrl

  // Intersection Observer for lazy loading
  useEffect(() => {
    // Check if IntersectionObserver is supported
    if (!window.IntersectionObserver) {
      // Fallback for older browsers - load immediately
      setIsInView(true)
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            // Shorter delay on mobile for better responsiveness
            const delay = window.innerWidth < 768 ? 50 : 100
            setTimeout(() => setShouldLoad(true), delay)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: window.innerWidth < 768 ? '20px' : '50px', // Smaller margin on mobile
        threshold: 0.1
      }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [])

  // Global video event listeners
  useEffect(() => {
    const handleVideoPlay = (event) => {
      const { videoId: playingVideoId } = event.detail
      console.log(`🎬 VideoCard received PLAY event from: ${playingVideoId}`)
      // If another video started playing, pause this one
      if (playingVideoId !== videoId && isPlaying) {
        console.log(`🎬 VideoCard pausing due to ${playingVideoId} playing`)
        if (videoRef.current) {
          videoRef.current.pause()
        }
        setIsPlaying(false)
      }
    }

    const handleVideoPause = (event) => {
      const { videoId: pausedVideoId } = event.detail
      console.log(`🎬 VideoCard received PAUSE event from: ${pausedVideoId}`)
      // If this video was paused by another video, update state
      if (pausedVideoId === videoId && isPlaying) {
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
  }, [videoId, isPlaying])

  // Cleanup video when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ''
        videoRef.current.load()
      }
    }
  }, [])

  const handlePlayPause = useCallback(() => {
    if (videoRef.current && isLoaded) {
      if (isPlaying) {
        // Pause this video
        videoRef.current.pause()
        dispatchVideoEvent(VIDEO_EVENTS.PAUSE, videoId)
      } else {
        // Notify other videos to pause
        dispatchVideoEvent(VIDEO_EVENTS.PLAY, videoId)
        
        // Try to play the video
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video started playing')
            })
            .catch(err => {
              console.error('Video play error:', err)
              setVideoError(true)
            })
        }
      }
    }
  }, [isPlaying, isLoaded, videoId])

  const handleVideoLoad = useCallback(() => {
    console.log('Video loaded successfully')
    setVideoError(false)
    setIsLoaded(true)
  }, [])

  const handleVideoError = useCallback((e) => {
    const videoElement = e.target
    const error = videoElement.error
    
    console.error('Video error for URL:', videoUrl)
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      name: error?.name,
      networkState: videoElement.networkState,
      readyState: videoElement.readyState,
      src: videoElement.src
    })
    
    setVideoError(true)
    setIsPlaying(false)
    setIsLoaded(false)
  }, [videoUrl])

  const handleVideoCanPlay = useCallback(() => {
    console.log('Video can play')
  }, [])

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleViewDetails = useCallback((e) => {
    e.preventDefault()
    if (videoUrl) {
      console.log('Navigating to video details:', videoUrl)
      navigate(`/video/${encodeURIComponent(videoUrl)}`)
    }
  }, [videoUrl, navigate])

  const handleVideoLabeling = useCallback((e) => {
    e.preventDefault()
    if (videoUrl) {
      console.log('Navigating to video labeling:', videoUrl)
      navigate('/analysis', { 
        state: { 
          selectedVideos: [video] 
        } 
      })
    }
  }, [video, navigate])

  // Keyboard navigation support
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handlePlayPause()
    }
  }, [handlePlayPause])

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      {/* Video Preview */}
      <div className="flex justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-36 h-48 sm:h-64 bg-gray-200 rounded overflow-hidden cursor-pointer group video-container">
          <div className="w-full h-full flex items-center justify-center">
            {shouldLoad && videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover"
                preload="metadata"
                playsInline
                disablePictureInPicture
                disableRemotePlayback
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoEnded}
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
                onCanPlay={handleVideoCanPlay}
                onKeyDown={handleKeyDown}
                onTouchStart={(e) => {
                  // Prevent default touch behavior that might interfere with video
                  e.preventDefault()
                }}
                tabIndex={0}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                {isInView && !shouldLoad ? (
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                ) : (
                  <Video className="w-8 h-8 text-gray-400" />
                )}
              </div>
            )}
          </div>
          
          {/* Play/Pause Overlay */}
          {isLoaded && !videoError && (
            <div 
              className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all cursor-pointer touch-manipulation"
              onClick={handlePlayPause}
              onTouchStart={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handlePlayPause()
              }}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="button"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </div>
          )}

          {/* Error State */}
          {videoError && (
            <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-xs text-red-600">Video unavailable</p>
              </div>
            </div>
          )}
          
          {/* Clips Count Overlay */}
          <div className="absolute top-2 right-2">
            <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded flex items-center">
              <Hash className="w-3 h-3 mr-1" />
              {video.clips?.length || 0} clips
            </div>
          </div>
          
          {/* Ad Type Overlay */}
          <div className="absolute bottom-2 right-2">
            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
              {video.adType || 'Unknown Type'}
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleViewDetails}
            className="btn-primary flex-1 text-center"
            disabled={!videoUrl}
          >
            <Eye className="w-4 h-4 mr-1" />
            View Clips
          </button>
          <button
            onClick={handleVideoLabeling}
            className="btn-secondary flex-1 text-center"
            disabled={!videoUrl}
          >
            <Tag className="w-4 h-4 mr-1" />
            AI Labeling
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoCard 