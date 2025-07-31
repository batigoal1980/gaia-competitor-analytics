# GAIA Video Ad Creative Analysis System

## Overview

The GAIA Video Ad Creative Analysis System is a sophisticated AI-powered pipeline that uses Google Gemini's video understanding capabilities to analyze and label video advertisements across different verticals and platforms. This system implements a hierarchical labeling architecture that provides context-aware insights for creative optimization.

## Features

### 🎯 Hierarchical Labeling Architecture

1. **Universal Analysis Layer**
   - Visual composition analysis (colors, lighting, camera work)
   - Audio elements (voice, music, sound effects)
   - Text overlays (positioning, style, animation)
   - Temporal structure (hooks, content, CTAs)
   - Performance indicators (engagement signals)

2. **Context Classification Layer**
   - Vertical detection (skincare, supplements, apparel, etc.)
   - Platform optimization analysis (TikTok, Facebook, YouTube)
   - Cross-context performance correlations

3. **Targeted Deep Analysis Layer**
   - Vertical-specific feature detection
   - Platform-specific optimization insights
   - Performance prediction and recommendations

### 📊 Analysis Capabilities

- **Multi-format video support**: MP4, MOV, AVI, WebM
- **Batch processing**: Analyze multiple videos simultaneously
- **Real-time progress tracking**: Monitor analysis status
- **Advanced filtering**: Filter by vertical, platform, confidence level
- **Detailed insights**: Expandable analysis cards with comprehensive data

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Existing MongoDB configuration
MONGODB_URI=mongodb://your-mongodb-connection-string

# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here

# Server configuration
PORT=5001
```

### 3. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env` file

### 4. Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Usage Guide

### Accessing the Video Analysis

1. Navigate to the application
2. Click on "Video Analysis" in the navigation bar
3. Upload video files (up to 100MB each)
4. Click "Start Analysis" to begin processing

### Understanding Analysis Results

#### Analysis Card Components

1. **Video Preview**: Thumbnail with confidence indicator
2. **Primary Classification**: 
   - Vertical (industry/category)
   - Platform optimization
   - Confidence score
3. **Key Strengths**: Top positive elements identified
4. **Detailed Analysis** (expandable):
   - Universal elements breakdown
   - Performance predictions
   - Optimization opportunities

#### Filtering Options

- **Vertical**: Filter by industry (skincare, supplements, apparel, etc.)
- **Platform**: Filter by platform optimization (TikTok, Facebook, YouTube)
- **Confidence**: Filter by analysis confidence level (high, medium, low)

### API Endpoints

#### Single Video Analysis
```
POST /api/gemini/analyze-video
Content-Type: multipart/form-data
Body: video file
```

#### Batch Video Analysis
```
POST /api/gemini/analyze-batch
Content-Type: multipart/form-data
Body: multiple video files
```

#### Get Analysis Results
```
GET /api/gemini/analyses?vertical=skincare&platform=tiktok&limit=10
```

#### Get Analytics Statistics
```
GET /api/gemini/analytics/stats
```

## Technical Architecture

### Backend Components

1. **GAIAVideoAnalyzer Class** (`gemini-video-analyzer.js`)
   - Implements the three-phase analysis pipeline
   - Manages knowledge bases for verticals and platforms
   - Handles Gemini API interactions

2. **API Routes** (`gemini-api-routes.js`)
   - File upload handling with Multer
   - Analysis request processing
   - Results storage and retrieval

3. **Database Integration**
   - MongoDB storage for analysis results
   - Aggregation queries for analytics
   - Performance tracking

### Frontend Components

1. **VideoAnalysis Page** (`src/pages/VideoAnalysis.jsx`)
   - File upload interface
   - Progress tracking
   - Results visualization

2. **AnalysisCard Component**
   - Individual analysis result display
   - Expandable detailed view
   - Confidence indicators

### Knowledge Base Structure

#### Vertical Knowledge
```javascript
skincare: {
  ingredients: ['retinol', 'hyaluronic acid', 'vitamin c'],
  visualCues: ['before_after_comparison', 'skin_texture_closeup'],
  performanceMetrics: ['transformation_visible', 'ingredient_highlight']
}
```

#### Platform Knowledge
```javascript
tiktok: {
  format: '9:16',
  optimalDuration: '15-60s',
  features: ['trending_audio', 'quick_hook', 'vertical_optimization'],
  performanceMetrics: ['engagement_rate', 'completion_rate']
}
```

## Analysis Pipeline

### Phase 1: Universal Analysis
- Extracts basic creative elements
- Identifies temporal structure
- Analyzes visual and audio quality

### Phase 2: Context Classification
- Detects vertical and platform
- Calculates confidence scores
- Identifies contextual modifiers

### Phase 3: Targeted Analysis
- Activates vertical-specific features
- Applies platform-specific metrics
- Generates performance predictions

## Performance Considerations

### Video Processing Limits
- **File size**: Up to 100MB per video
- **Duration**: Up to 2 hours (Gemini 2.0 models)
- **Batch size**: Up to 10 videos per batch
- **Format support**: MP4, MOV, AVI, WebM

### API Rate Limits
- **Gemini API**: Follow Google's rate limits
- **Processing time**: ~30-60 seconds per video
- **Concurrent requests**: Limited by server capacity

## Troubleshooting

### Common Issues

1. **API Key Error**
   - Verify GEMINI_API_KEY in .env file
   - Check API key permissions and quotas

2. **File Upload Failures**
   - Ensure file size is under 100MB
   - Check file format compatibility
   - Verify upload directory permissions

3. **Analysis Failures**
   - Check video file integrity
   - Verify Gemini API availability
   - Review server logs for detailed errors

### Debug Mode

Enable detailed logging by setting:
```env
DEBUG=true
NODE_ENV=development
```

## Future Enhancements

### Planned Features
- **Custom vertical definitions**: User-defined vertical knowledge bases
- **Performance correlation**: Link analysis results to actual campaign performance
- **Automated optimization**: AI-generated creative recommendations
- **Real-time analysis**: Live video stream processing
- **Advanced filtering**: More granular filtering options

### Integration Opportunities
- **Ad platform APIs**: Direct integration with Facebook, TikTok, YouTube
- **Performance data**: Import actual campaign metrics
- **Creative tools**: Export optimization recommendations
- **Team collaboration**: Multi-user analysis workflows

## Support

For technical support or feature requests:
- Check the application logs for error details
- Review the API documentation
- Contact the development team

## License

This project is proprietary software. All rights reserved. 