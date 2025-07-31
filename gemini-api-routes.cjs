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

// Route to export analysis results as CSV
router.post('/export-csv', async (req, res) => {
  console.log('📊 CSV Export endpoint called');
  console.log('📋 Request body:', req.body);

  try {
    const { analysisResults } = req.body;
    
    if (!analysisResults || !Array.isArray(analysisResults)) {
      return res.status(400).json({ 
        error: 'No analysis results provided or invalid format'
      });
    }

    // Convert analysis results to CSV format
    let csvContent = 'Video Filename,Section,Item Number,Content,Detected Vertical,Detected Platform\n';
    let totalItems = 0;
    
    analysisResults.forEach(result => {
      const videoFilename = result.videoInfo?.filename || 'Unknown';
      
      // Extract context information from the analysis text
      let detectedVertical = 'Unknown';
      let detectedPlatform = 'Unknown';
      
      if (result.analysis) {
        const analysisText = typeof result.analysis === 'string' ? result.analysis : result.analysis.analysis || '';
        
        // Extract vertical and platform from context detection section
        const verticalMatch = analysisText.match(/Detected Vertical:\s*([^\n]+)/);
        if (verticalMatch) {
          detectedVertical = verticalMatch[1].trim();
        }
        
        const platformMatch = analysisText.match(/Detected Platform:\s*([^\n]+)/);
        if (platformMatch) {
          detectedPlatform = platformMatch[1].trim();
        }
        
        // Parse sections and items using the EXACT same logic as the frontend
        const lines = analysisText.split('\n');
        let currentSection = null;
        let currentItems = [];
        
        console.log(`📄 Parsing analysis text with ${lines.length} lines`);
        console.log(`📄 Analysis text preview: ${analysisText.substring(0, 500)}...`);
        
        // Use the exact same parsing logic as the frontend
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          console.log(`🔍 Processing line: "${trimmedLine}"`);
          
          // Check if this is a section header (starts with ** and ends with **)
          if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
            // Save previous section if exists
            if (currentSection && currentItems.length > 0) {
              // Add all items from the previous section to CSV
              currentItems.forEach((item, index) => {
                totalItems++;
                const content = item.replace(/"/g, '""'); // Escape quotes for CSV
                csvContent += `"${videoFilename}","${currentSection}","${index + 1}","${content}","${detectedVertical}","${detectedPlatform}"\n`;
                console.log(`📝 Added item ${index + 1} to ${currentSection}: ${content.substring(0, 50)}...`);
              });
            }
            // Start new section (clean up the title)
            currentSection = trimmedLine
              .replace(/\*\*/g, '') // Remove **
              .replace(/:$/, '') // Remove trailing :
              .trim();
            currentItems = [];
            console.log(`📋 Found section: ${currentSection}`);
            console.log(`📋 Current section state: ${currentSection}, items count: ${currentItems.length}`);
          } else if (currentSection && trimmedLine.match(/^\d+\./)) {
            // This is a numbered item
            const item = trimmedLine.replace(/^\d+\.\s*/, '');
            currentItems.push(item);
            console.log(`📝 Found numbered item: "${item}"`);
          } else if (currentSection && trimmedLine.startsWith('- ')) {
            // This is a bullet point item
            const item = trimmedLine.replace(/^-\s*/, '');
            currentItems.push(item);
            console.log(`📝 Found bullet item: "${item}"`);
          } else if (currentSection && trimmedLine.length > 0) {
            // If we have a current section, treat as unnumbered item
            currentItems.push(trimmedLine);
            console.log(`📝 Found unnumbered item: "${trimmedLine}"`);
          }
        }
        
        // Save the last section
        if (currentSection && currentItems.length > 0) {
          currentItems.forEach((item, index) => {
            totalItems++;
            const content = item.replace(/"/g, '""'); // Escape quotes for CSV
            csvContent += `"${videoFilename}","${currentSection}","${index + 1}","${content}","${detectedVertical}","${detectedPlatform}"\n`;
            console.log(`📝 Added final item ${index + 1} to ${currentSection}: ${content.substring(0, 50)}...`);
          });
        }
      }
    });
    
    console.log(`📊 Total items parsed: ${totalItems}`);
    console.log(`📊 CSV content preview: ${csvContent.substring(0, 1000)}...`);
    console.log(`📄 CSV content length: ${csvContent.length} characters`);
    console.log(`📄 CSV preview: ${csvContent.substring(0, 500)}...`);
    
    // Additional debugging: show what sections were found
    if (totalItems === 0) {
      console.log(`⚠️ No items parsed! Analysis text structure:`, analysisResults.map(result => {
        const text = typeof result.analysis === 'string' ? result.analysis : result.analysis?.analysis || 'No analysis text';
        const lines = text.split('\n');
        const sectionHeaders = lines.filter(line => line.trim().startsWith('**') && line.trim().endsWith('**'));
        return {
          filename: result.videoInfo?.filename || 'Unknown',
          totalLines: lines.length,
          sectionHeaders: sectionHeaders,
          firstFewLines: lines.slice(0, 10)
        };
      }));
    }

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="video-analysis-${new Date().toISOString().split('T')[0]}.csv"`);
    
    console.log(`✅ CSV export completed: ${analysisResults.length} videos, ${csvContent.split('\n').length - 1} labels`);
    res.send(csvContent);

  } catch (error) {
    console.error('❌ CSV export error:', error);
    res.status(500).json({
      error: 'CSV export failed',
      details: error.message
    });
  }
});

module.exports = router; 