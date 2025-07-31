import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, RefreshCw, CheckCircle, AlertCircle, Clock, ArrowLeft, Loader2, Video, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useLocation, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

// Global video management system (same as VideoPlayer and VideoCard)
const VIDEO_EVENTS = {
  PLAY: 'video-play',
  PAUSE: 'video-pause'
}

// Custom event dispatcher
const dispatchVideoEvent = (eventType, videoId) => {
  console.log(`🎬 VideoAnalysis dispatching ${eventType} event for video: ${videoId}`)
  window.dispatchEvent(new CustomEvent(eventType, { detail: { videoId } }))
}

const VideoLabeling = () => {
  const [selectedVideos, setSelectedVideos] = useState([])
  const [analysisResults, setAnalysisResults] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [videoLoadingStates, setVideoLoadingStates] = useState({})
  const [videoStates, setVideoStates] = useState({}) // Track play/pause state for each video
  const [totalEstimatedTime, setTotalEstimatedTime] = useState(0) // Track total estimated time
  const [videoEstimates, setVideoEstimates] = useState({}) // Track individual video estimates
  const videoRefs = useRef({}) // Add refs for video elements
  const location = useLocation()
  const navigate = useNavigate()
  
  // Get selected videos from navigation state
  useEffect(() => {
    if (location.state?.selectedVideos) {
      setSelectedVideos(location.state.selectedVideos)
    }
  }, [location.state])

  // Helper function to format labels as text
  const formatLabelsAsText = (labels) => {
    if (!Array.isArray(labels)) {
      return JSON.stringify(labels, null, 2)
    }
    
    let formattedText = ''
    let currentSection = ''
    
    labels.forEach((label, index) => {
      // If label has a category/section, add section header
      if (label.category && label.category !== currentSection) {
        currentSection = label.category
        formattedText += `\n**${currentSection}:**\n`
      }
      
      // Add the label
      formattedText += `${index + 1}. ${label.text || label.label || label}\n`
    })
    
    return formattedText.trim()
  }

  const handleBackToLibrary = () => {
    navigate('/videos')
  }

  const handleExportCSV = async () => {
    if (analysisResults.length === 0) {
      alert('No analysis results to export')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/export-csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisResults: analysisResults
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Get the CSV content
      const csvContent = await response.text()
      
      // Create a blob and download it
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `video-analysis-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log('✅ CSV export completed successfully')
    } catch (error) {
      console.error('❌ CSV export error:', error)
      alert('Failed to export CSV: ' + error.message)
    }
  }

  // Global video event listeners for analysis videos
  useEffect(() => {
    const handleVideoPlay = (event) => {
      const { videoId: playingVideoId } = event.detail
      console.log(`🎬 VideoAnalysis received PLAY event from: ${playingVideoId}`)
      
      // If another video started playing, pause all analysis videos
      const isAnyAnalysisVideoPlaying = Object.values(videoStates).some(playing => playing)
      if (isAnyAnalysisVideoPlaying && !playingVideoId.startsWith('analysis-')) {
        console.log(`🎬 Pausing all analysis videos due to ${playingVideoId} playing`)
        setVideoStates(prev => {
          const newStates = {}
          Object.keys(prev).forEach(url => {
            newStates[url] = false
          })
          return newStates
        })
      }
    }

    const handleVideoPause = (event) => {
      const { videoId: pausedVideoId } = event.detail
      console.log(`🎬 VideoAnalysis received PAUSE event from: ${pausedVideoId}`)
      // If an analysis video was paused by another video, update state
      if (pausedVideoId.startsWith('analysis-')) {
        const videoUrl = pausedVideoId.replace('analysis-', '')
        if (videoStates[videoUrl]) {
          setVideoStates(prev => ({ ...prev, [videoUrl]: false }))
        }
      }
    }

    // Listen for global video events
    window.addEventListener(VIDEO_EVENTS.PLAY, handleVideoPlay)
    window.addEventListener(VIDEO_EVENTS.PAUSE, handleVideoPause)

    return () => {
      window.removeEventListener(VIDEO_EVENTS.PLAY, handleVideoPlay)
      window.removeEventListener(VIDEO_EVENTS.PAUSE, handleVideoPause)
    }
  }, [videoStates])

  // Video management functions with global event system
  const handleVideoPlay = useCallback((videoUrl) => {
    console.log(`🎬 VideoAnalysis native play event for video: ${videoUrl}`)
    setVideoStates(prev => ({ ...prev, [videoUrl]: true }))
    // Dispatch global play event to pause other videos
    dispatchVideoEvent(VIDEO_EVENTS.PLAY, `analysis-${videoUrl}`)
  }, [])

  const handleVideoPause = useCallback((videoUrl) => {
    console.log(`🎬 VideoAnalysis native pause event for video: ${videoUrl}`)
    setVideoStates(prev => ({ ...prev, [videoUrl]: false }))
    // Dispatch global pause event
    dispatchVideoEvent(VIDEO_EVENTS.PAUSE, `analysis-${videoUrl}`)
  }, [])

  const handleVideoEnded = useCallback((videoUrl) => {
    setVideoStates(prev => ({ ...prev, [videoUrl]: false }))
  }, [])



  const handleVideoLoad = (videoUrl) => {
    console.log('Manually loading video:', videoUrl);
    setVideoLoadingStates(prev => ({ ...prev, [videoUrl]: 'loading' }));
    
    // Find the video element and trigger load
    const videoElement = document.querySelector(`video[src="${videoUrl}"]`);
    if (videoElement) {
      videoElement.load();
    }
  }

  // Helper function to estimate analysis time based on video duration
  // Base: ≤8 minutes = 60 seconds (2x), then proportional growth
  const estimateAnalysisTime = (durationMinutes) => {
    if (durationMinutes <= 8) return 60  // Base case: ≤8 min = 60 seconds (2x)
    if (durationMinutes <= 16) return 120 // 16 min = 120 seconds (2x)
    if (durationMinutes <= 24) return 180 // 24 min = 180 seconds (2x)
    if (durationMinutes <= 32) return 240 // 32 min = 240 seconds (2x)
    if (durationMinutes <= 40) return 300 // 40 min = 300 seconds (2x)
    if (durationMinutes <= 60) return 450 // 60 min = 450 seconds (2x)
    return Math.ceil(durationMinutes * 7.5) // For very long videos: 7.5 seconds per minute (2x)
  }

  // Helper function to get video duration from video element
  const getVideoDuration = (videoUrl) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.src = videoUrl
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        const durationMinutes = video.duration / 60 // Convert seconds to minutes
        console.log(`📹 Video duration for ${videoUrl}: ${video.duration}s (${durationMinutes.toFixed(2)}min)`)
        resolve(durationMinutes)
        video.remove() // Clean up
      }
      
      video.onerror = () => {
        console.warn(`⚠️ Could not load video metadata for ${videoUrl}, using default estimate`)
        resolve(2) // Default 2 minutes if we can't get duration
        video.remove() // Clean up
      }
      
      // Set a timeout in case the video doesn't load
      setTimeout(() => {
        console.warn(`⚠️ Timeout loading video metadata for ${videoUrl}, using default estimate`)
        resolve(2) // Default 2 minutes
        video.remove() // Clean up
      }, 5000) // 5 second timeout
    })
  }

  const labelVideos = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    
    // Get actual video durations and calculate total duration
    let totalDuration = 0
    const videoEstimates = []
    
    for (const video of selectedVideos) {
      const actualDurationMinutes = await getVideoDuration(video.wholeVideoUrl)
      const estimatedTime = estimateAnalysisTime(actualDurationMinutes)
      totalDuration += estimatedTime
      videoEstimates.push({ video, estimatedTime, actualDurationMinutes })
    }
    
    console.log(`📊 Total estimated duration: ${totalDuration} seconds for ${selectedVideos.length} videos`)
    console.log(`📊 Video estimates:`, videoEstimates.map(v => `${v.video.wholeVideoUrl.split('/').pop()}: ${v.estimatedTime}s (${v.actualDurationMinutes.toFixed(2)}min)`))
    
    // Set the total estimated time for UI display
    setTotalEstimatedTime(totalDuration)
    
    // Store individual video estimates for UI display
    const estimatesMap = {}
    videoEstimates.forEach(({ video, estimatedTime }) => {
      estimatesMap[video.wholeVideoUrl] = estimatedTime
    })
    setVideoEstimates(estimatesMap)
    
    // Calculate progress increment per second
    const progressIncrement = 100 / totalDuration // 100% over total duration
    
    // Start progress bar
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        const newProgress = prev + progressIncrement
        // If analysis is complete, jump to 100%
        if (newProgress >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return newProgress
      })
    }, 1000)
    
    for (let video of selectedVideos) {
      try {
        console.log(`🚀 Starting analysis for video: ${video.wholeVideoUrl}`)
        console.log(`🌐 API Base URL: ${API_BASE_URL}`)
        
        // Update status to analyzing
        setSelectedVideos(prev => 
          prev.map(v => v.wholeVideoUrl === video.wholeVideoUrl ? { ...v, status: 'analyzing', progress: 0 } : v)
        )

        // Call the analysis API with video URL
        const response = await fetch(`${API_BASE_URL}/api/gemini/analyze-video-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoUrl: video.wholeVideoUrl,
            videoName: video.wholeVideoUrl.split('/').pop() || 'video.mp4'
          })
        })
            
        console.log(`📥 Response status: ${response.status}`)
        console.log(`📥 Response status text: ${response.statusText}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ HTTP Error ${response.status}: ${errorText}`)
          throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${errorText}`)
        }

        const responseText = await response.text()
        console.log(`📄 Raw response text:`, responseText.substring(0, 500) + '...')

        let result
        try {
          result = JSON.parse(responseText)
          console.log(`✅ Successfully parsed JSON response`)
        } catch (parseError) {
          console.error(`❌ JSON Parse Error:`, parseError)
          console.log(`📄 Raw response text:`, responseText)
          
          // Handle raw text response (non-JSON)
          result = {
            success: true,
            videoInfo: { filename: video.wholeVideoUrl.split('/').pop() || 'video.mp4' },
            analysis: responseText // Store the raw text as analysis
          }
          console.log(`✅ Using raw text response`)
        }

        if (result.success) {
          console.log(`✅ Analysis completed successfully for: ${video.wholeVideoUrl}`)
          console.log(`📊 Analysis result:`, result)
          
          // Handle different analysis response formats
          console.log('🔍 Processing analysis result:', {
            type: typeof result.analysis,
            hasAnalysis: result.analysis?.analysis,
            hasLabels: result.analysis?.labels,
            keys: result.analysis ? Object.keys(result.analysis) : 'no analysis'
          })
          
          let analysisText
          if (typeof result.analysis === 'string') {
            // Direct string response
            analysisText = result.analysis
            console.log('📝 Using direct string analysis')
          } else if (result.analysis && typeof result.analysis === 'object') {
            // Object response - check for nested analysis property
            if (result.analysis.analysis) {
              analysisText = result.analysis.analysis
              console.log('📝 Using nested analysis property')
            } else if (result.analysis.labels) {
              // If it has labels, format them nicely
              analysisText = formatLabelsAsText(result.analysis.labels)
              console.log('📝 Using formatted labels')
            } else {
              // Fallback to JSON string
              analysisText = JSON.stringify(result.analysis, null, 2)
              console.log('📝 Using JSON fallback')
            }
          } else {
            // Fallback
            analysisText = JSON.stringify(result.analysis)
            console.log('📝 Using final fallback')
          }
          
          console.log('📄 Final analysis text length:', analysisText?.length || 0)
          console.log('📄 Analysis text preview:', analysisText?.substring(0, 200) + '...')
          
          // Add to analysis results
          setAnalysisResults(prev => [...prev, {
            id: video.wholeVideoUrl,
            videoInfo: result.videoInfo,
            analysis: analysisText
          }])
          
          // Update video status to completed
          setSelectedVideos(prev => 
            prev.map(v => v.wholeVideoUrl === video.wholeVideoUrl ? { ...v, status: 'completed' } : v)
          )
        } else {
          console.error(`❌ Analysis failed with error:`, result.error)
          throw new Error(result.error || 'Unknown analysis error')
        }
      } catch (error) {
        console.error(`❌ Analysis error for ${video.wholeVideoUrl}:`, error)
        console.error(`❌ Error stack:`, error.stack)
        setSelectedVideos(prev => 
          prev.map(v => v.wholeVideoUrl === video.wholeVideoUrl ? { ...v, status: 'failed', error: error.message } : v)
        )
          }
    
    console.log(`🏁 Analysis batch completed`)
    clearInterval(progressInterval)
    setAnalysisProgress(100)
    setIsAnalyzing(false)
  }
  }



  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'analyzing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return 'text-green-600 bg-green-100'
    if (confidence > 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Ad Creative Labeling</h1>
          <p className="text-gray-600 mt-1">Analyze creative elements of selected videos using ShowStop's AI-powered labeling system</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleBackToLibrary}
            className="btn-outline flex items-center"
            disabled={isAnalyzing}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </button>
        </div>
      </div>

      {/* Main Content - Video Cards and Results Side by Side */}
      {selectedVideos.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Cards Section - Fixed on Left */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Selected Videos</h3>
                {isAnalyzing && (
                  <div className="text-sm text-blue-600">
                    Total estimated time: {totalEstimatedTime}s
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {selectedVideos.map(video => (
                  <div key={video.wholeVideoUrl} className="bg-gray-50 rounded-lg p-4">
                    {/* Video Preview */}
                    <div className="flex flex-col items-center mb-3">
                      <div className="relative w-full max-w-48 h-64 bg-gray-200 rounded overflow-hidden cursor-pointer group video-container">
                        <div className="w-full h-full flex items-center justify-center">
                          {video.wholeVideoUrl ? (
                            <video
                              ref={(el) => {
                                if (el) videoRefs.current[video.wholeVideoUrl] = el
                              }}
                              src={video.wholeVideoUrl}
                              className="w-full h-full object-cover"
                              preload="metadata"
                              playsInline
                              controls={true}
                              onPlay={() => handleVideoPlay(video.wholeVideoUrl)}
                              onPause={() => handleVideoPause(video.wholeVideoUrl)}
                              onEnded={() => handleVideoEnded(video.wholeVideoUrl)}
                              onLoadedData={() => {
                                console.log('Video loaded successfully:', video.wholeVideoUrl);
                                setVideoLoadingStates(prev => ({ ...prev, [video.wholeVideoUrl]: 'loaded' }));
                              }}
                              onError={(e) => {
                                console.error('Video load error:', e.target.error);
                                setVideoLoadingStates(prev => ({ ...prev, [video.wholeVideoUrl]: 'error' }));
                              }}
                              onCanPlay={() => {
                                console.log('Video can play:', video.wholeVideoUrl);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  const videoElement = videoRefs.current[video.wholeVideoUrl]
                                  if (videoElement) {
                                    if (videoStates[video.wholeVideoUrl]) {
                                      videoElement.pause()
                                    } else {
                                      videoElement.play()
                                    }
                                  }
                                }
                              }}
                              onTouchStart={() => {
                                console.log('Video touch start - videoUrl:', video.wholeVideoUrl)
                              }}
                              tabIndex={0}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Video className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        


                        {/* Error State */}
                        {videoLoadingStates[video.wholeVideoUrl] === 'error' && (
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
                            <span className="mr-1">#</span>
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
                    
                    {/* Video Info and Status */}
                    <div className="text-center mb-3">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        {getStatusIcon(video.status || 'pending')}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{video.wholeVideoUrl.split('/').pop() || 'video.mp4'}</p>
                          <p className="text-xs text-gray-500">
                            {video.clips?.length || 0} clips • {video.adType || 'Unknown format'}
                            {video.status === 'analyzing' && (
                              <span className="ml-2 text-blue-600">
                                (est. {videoEstimates[video.wholeVideoUrl] || 60}s)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {video.status === 'analyzing' && (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${analysisProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-blue-600 font-mono">
                            {analysisProgress}%
                          </span>
                        </div>
                      )}
                      {video.status === 'failed' && (
                        <span className="text-xs text-red-600">{video.error}</span>
                      )}
                    </div>
                    
                    {/* Start Labeling Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={labelVideos}
                        className="btn-secondary flex items-center text-sm px-3 py-2"
                        disabled={selectedVideos.length === 0 || isAnalyzing}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {isAnalyzing ? 'Labeling...' : 'Start Labeling'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Labeling Results Section - Scrollable on Right */}
          <div className="lg:col-span-2">
            {analysisResults.length > 0 ? (
              <div className="card">
                          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Labeling Results ({analysisResults.length} videos)
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportCSV}
                className="btn-secondary flex items-center text-sm"
                disabled={analysisResults.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => setAnalysisResults([])}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            </div>
          </div>

                {/* Results - Scrollable */}
                <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {analysisResults.map(result => (
                    <AnalysisCard key={result.id} result={result} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Results Yet</h3>
                  <p className="text-gray-600">Click "Start Labeling" to begin analyzing your selected videos.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}



const OrganizedAnalysisSections = ({ analysis }) => {
  // Parse the analysis text into sections
  const parseAnalysis = (text) => {
    const sections = {}
    const lines = text.split('\n')
    let currentSection = null
    let currentItems = []
    
    // Look for section headers with ** pattern
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue
      
      // Check if this is a section header (starts with ** and ends with **)
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        // Save previous section if exists
        if (currentSection && currentItems.length > 0) {
          sections[currentSection] = currentItems
        }
        // Start new section (clean up the title)
        currentSection = trimmedLine
          .replace(/\*\*/g, '') // Remove **
          .replace(/:$/, '') // Remove trailing :
          .trim()
        currentItems = []
        console.log('🔍 Found section:', currentSection)
      } else if (currentSection && trimmedLine.match(/^\d+\./)) {
        // This is a numbered item
        const item = trimmedLine.replace(/^\d+\.\s*/, '')
        currentItems.push(item)
      } else if (currentSection && trimmedLine.startsWith('- ')) {
        // This is a bullet point item
        const item = trimmedLine.replace(/^-\s*/, '')
        currentItems.push(item)
      } else if (currentSection && trimmedLine.length > 0) {
        // If we have a current section, treat as unnumbered item
        currentItems.push(trimmedLine)
      }
    }
    
    // Save the last section
    if (currentSection && currentItems.length > 0) {
      sections[currentSection] = currentItems
    }
    
    console.log('📋 Parsed sections:', Object.keys(sections))
    return sections
  }
  
  // Fallback organization by content type
  const organizeByContentType = (lines) => {
    const sections = {
      'Visual Elements': [],
      'Audio Elements': [],
      'Text & Messaging': [],
      'Temporal Structure': [],
      'Performance & Context': [],
      'Other Elements': []
    }
    
    const visualKeywords = ['visual', 'camera', 'shot', 'composition', 'lighting', 'color', 'scene', 'setting', 'background', 'transition', 'effect', 'animation', 'footage', 'image']
    const audioKeywords = ['audio', 'voice', 'music', 'sound', 'narration', 'speech', 'tone', 'accent', 'background music', 'voiceover']
    const textKeywords = ['text', 'overlay', 'typography', 'font', 'message', 'copy', 'headline', 'subtitle', 'caption', 'brand', 'logo']
    const temporalKeywords = ['temporal', 'structure', 'timing', 'sequence', 'flow', 'pacing', 'rhythm', 'timeline', 'chronological', 'order', 'progression', 'development']
    const performanceKeywords = ['performance', 'engagement', 'conversion', 'hook', 'call-to-action', 'cta', 'narrative', 'story', 'duration', 'format', 'platform', 'vertical', 'context']
    
    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('**')) return
      
      const lowerLine = trimmedLine.toLowerCase()
      let categorized = false
      
      // Remove numbering if present
      const cleanLine = trimmedLine.replace(/^\d+\.\s*/, '')
      
      // Categorize based on keywords
      if (visualKeywords.some(keyword => lowerLine.includes(keyword))) {
        sections['Visual Elements'].push(cleanLine)
        categorized = true
      } else if (audioKeywords.some(keyword => lowerLine.includes(keyword))) {
        sections['Audio Elements'].push(cleanLine)
        categorized = true
      } else if (textKeywords.some(keyword => lowerLine.includes(keyword))) {
        sections['Text & Messaging'].push(cleanLine)
        categorized = true
      } else if (temporalKeywords.some(keyword => lowerLine.includes(keyword))) {
        sections['Temporal Structure'].push(cleanLine)
        categorized = true
      } else if (performanceKeywords.some(keyword => lowerLine.includes(keyword))) {
        sections['Performance & Context'].push(cleanLine)
        categorized = true
      }
      
      if (!categorized) {
        sections['Other Elements'].push(cleanLine)
      }
    })
    
    // Remove empty sections
    Object.keys(sections).forEach(key => {
      if (sections[key].length === 0) {
        delete sections[key]
      }
    })
    
    console.log('📋 Content-based sections:', Object.keys(sections))
    return sections
  }
  
  const sections = parseAnalysis(analysis)
  
  const getSectionIcon = (section) => {
    const lowerSection = section.toLowerCase()
    if (lowerSection.includes('context detection')) return '🔍'
    if (lowerSection.includes('visual composition')) return '🎨'
    if (lowerSection.includes('audio elements')) return '🎵'
    if (lowerSection.includes('text overlays')) return '📝'
    if (lowerSection.includes('temporal structure')) return '⏱️'
    if (lowerSection.includes('performance indicators')) return '📊'
    if (lowerSection.includes('vertical context')) return '🎯'
    if (lowerSection.includes('platform context')) return '📱'
    return '📋'
  }
  
  const getSectionColor = (section) => {
    const lowerSection = section.toLowerCase()
    if (lowerSection.includes('context detection')) return 'border-gray-200 bg-gray-50'
    if (lowerSection.includes('visual composition')) return 'border-blue-200 bg-blue-50'
    if (lowerSection.includes('audio elements')) return 'border-green-200 bg-green-50'
    if (lowerSection.includes('text overlays')) return 'border-purple-200 bg-purple-50'
    if (lowerSection.includes('temporal structure')) return 'border-orange-200 bg-orange-50'
    if (lowerSection.includes('performance indicators')) return 'border-red-200 bg-red-50'
    if (lowerSection.includes('vertical context')) return 'border-indigo-200 bg-indigo-50'
    if (lowerSection.includes('platform context')) return 'border-pink-200 bg-pink-50'
    return 'border-gray-200 bg-gray-50'
  }
  
  // Sort sections in a logical order
  const sortSections = (sections) => {
    const sectionOrder = [
      'VISUAL COMPOSITION',
      'AUDIO ELEMENTS',
      'TEXT OVERLAYS',
      'TEMPORAL STRUCTURE',
      'PERFORMANCE INDICATORS',
      'VERTICAL CONTEXT',
      'PLATFORM CONTEXT',
      'CONTEXT DETECTION'
    ]
    
    return Object.entries(sections).sort(([a], [b]) => {
      const aIndex = sectionOrder.findIndex(s => a.toLowerCase().includes(s.toLowerCase()))
      const bIndex = sectionOrder.findIndex(s => b.toLowerCase().includes(s.toLowerCase()))
      
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }
  
  const sortedSections = sortSections(sections)
  
  return (
    <div className="space-y-6 w-full">
      {sortedSections.map(([section, items]) => (
        <div key={section} className={`border-2 rounded-lg p-4 ${getSectionColor(section)} w-full`}>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">{getSectionIcon(section)}</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{section}</h3>
              {section.includes('BASE LAYER') || section.includes('MIDDLE LAYER') || section.includes('TOP LAYER') ? (
                <p className="text-sm text-gray-600 mt-1">{section.split(':')[1] || ''}</p>
              ) : null}
            </div>
            <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full">
              {items.length} items
            </span>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {items.map((item, index) => (
              <div key={index} className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 leading-relaxed">
                    {item}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const AnalysisCard = ({ result }) => {
  const analysis = result.analysis

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Analysis Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">{result.videoInfo.filename}</h4>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
            Labeling Complete
          </span>
        </div>
        
        {/* Organized Labeling Display - Full Width */}
        <div className="space-y-6 w-full">
          <h5 className="text-sm font-medium text-gray-900">Video Creative Labels:</h5>
          {typeof analysis === 'string' && analysis.trim() ? (
            <OrganizedAnalysisSections analysis={analysis} />
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Raw Analysis Data:</div>
              <pre className="text-xs text-gray-700 bg-white p-3 rounded border overflow-auto max-h-96">
                {typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoLabeling 