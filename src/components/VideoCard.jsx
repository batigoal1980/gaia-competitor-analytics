import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Heart, Share2, DollarSign, Play, Video, Hash, Pause } from 'lucide-react'

const VideoCard = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef(null)

  // Get the video URL with fallback
  const videoUrl = video.wholeVideoUrl || video.videoUrl

  console.log('VideoCard render:', {
    videoUrl,
    wholeVideoUrl: video.wholeVideoUrl,
    originalVideoUrl: video.videoUrl,
    clips: video.clips?.length
  })

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        // Try to play the video
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Video started playing successfully
              console.log('Video started playing')
            })
            .catch(err => {
              console.error('Video play error:', err)
              setVideoError(true)
            })
        }
      }
    }
  }

  const handleVideoLoad = () => {
    console.log('Video loaded successfully')
    setVideoError(false)
  }

  const handleVideoError = (e) => {
    console.error('Video error:', e)
    setVideoError(true)
    setIsPlaying(false)
  }

  const handleVideoCanPlay = () => {
    console.log('Video can play')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Video Preview */}
      <div className="flex justify-center p-4">
        <div className="relative w-36 h-64 bg-gray-200 rounded overflow-hidden cursor-pointer group">
          <div className="w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              onCanPlay={handleVideoCanPlay}
            />
          </div>
          
          <div 
            className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </div>
          
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
          <Link
            to={`/video/${encodeURIComponent(videoUrl)}`}
            className="btn-primary flex-1 text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VideoCard 