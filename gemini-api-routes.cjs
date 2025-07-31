const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const GAIAVideoAnalyzer = require('./gemini-video-analyzer.cjs');

const router = express.Router();

console.log('🎬 Gemini API routes initialized');

// Test endpoint to verify routes are working
router.get('/test', (req, res) => {
  console.log('🧪 Gemini API test endpoint called');
  res.json({
    success: true,
    message: 'Gemini API routes are working',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/gemini/test',
      'POST /api/gemini/analyze-video',
      'POST /api/gemini/analyze-batch'
    ]
  });
});

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
  }
});

// Initialize GAIA Video Analyzer with your API key
const analyzer = new GAIAVideoAnalyzer('AIzaSyCX3eFcWUGYky2RXPzlBNxBe9yubmBIwro');

// Route to analyze a single video
router.post('/analyze-video', upload.single('video'), async (req, res) => {
  console.log('🎬 Gemini API: /analyze-video endpoint called')
  console.log('📋 Request headers:', req.headers)
  console.log('📋 Request body keys:', Object.keys(req.body))
  console.log('📁 Request file:', req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'No file uploaded')

  try {
    if (!req.file) {
      console.error('❌ No video file uploaded')
      return res.status(400).json({ 
        error: 'No video file uploaded',
        receivedFiles: req.files ? Object.keys(req.files) : 'none',
        receivedBody: Object.keys(req.body)
      });
    }

    console.log('✅ Video file received successfully')
    console.log('📁 File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      path: req.file.path
    });
    
    console.log('🔍 Starting video analysis...')
    const analysis = await analyzer.analyzeVideo(req.file.path);
    console.log('✅ Video analysis completed successfully')
    
    const response = {
      success: true,
      analysis: analysis,
      videoInfo: {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    };

    console.log('📤 Sending response:', {
      success: response.success,
      videoInfo: response.videoInfo,
      analysisType: typeof response.analysis,
      analysisKeys: typeof response.analysis === 'object' ? Object.keys(response.analysis) : 'not an object',
      analysisPreview: typeof response.analysis === 'string' ? 
        response.analysis.substring(0, 200) + '...' : 
        JSON.stringify(response.analysis).substring(0, 200) + '...'
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Video analysis error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      error: 'Video analysis failed',
      details: error.message,
      stack: error.stack
    });
  }
});

// Route to analyze video by URL
router.post('/analyze-video-url', async (req, res) => {
  console.log('🎬 Gemini API: /analyze-video-url endpoint called')
  console.log('📋 Request body:', req.body)

  try {
    const { videoUrl, videoName } = req.body;
    
    if (!videoUrl) {
      console.error('❌ No video URL provided')
      return res.status(400).json({ 
        error: 'No video URL provided',
        receivedBody: req.body
      });
    }

    console.log('✅ Video URL received successfully')
    console.log('📁 Video details:', {
      url: videoUrl,
      name: videoName || 'video.mp4'
    });
    
    console.log('🔍 Starting video analysis...')
    const analysis = await analyzer.analyzeVideoByUrl(videoUrl);
    console.log('✅ Video analysis completed successfully')
    
    const response = {
      success: true,
      analysis: analysis,
      videoInfo: {
        filename: videoName || videoUrl.split('/').pop() || 'video.mp4',
        url: videoUrl
      }
    };

    console.log('📤 Sending response:', {
      success: response.success,
      videoInfo: response.videoInfo,
      analysisType: typeof response.analysis
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Video analysis error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      error: 'Video analysis failed',
      details: error.message,
      stack: error.stack
    });
  }
});

// Route to analyze multiple videos (batch processing)
router.post('/analyze-batch', upload.array('videos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No video files uploaded' });
    }

    console.log(`Analyzing ${req.files.length} videos...`);
    
    const videoPaths = req.files.map(file => file.path);
    const batchResults = await analyzer.analyzeBatch(videoPaths);

    res.json({
      success: true,
      ...batchResults
    });

  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      error: 'Batch analysis failed',
      details: error.message
    });
  }
});

module.exports = router; 