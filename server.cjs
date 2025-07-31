const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import Gemini API routes
const geminiRoutes = require('./gemini-api-routes.cjs');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5001', 
    'https://gaia-competitor-analytics-production.up.railway.app',
    'https://gaia-competitor-analytics-93u0cb6eh-batigoal1980s-projects.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Serve static files from the React app build
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('Serving static files from:', distPath);
} else {
  console.log('Warning: dist folder not found, static files will not be served');
}

// API Routes
app.use('/api/gemini', geminiRoutes);
console.log('✅ Gemini API routes mounted at /api/gemini');

// Test endpoint to verify server is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      gemini: '/api/gemini',
      videoFormats: '/api/video-formats',
      videos: '/api/videos',
      wholeVideo: '/api/videos/whole-video/:videoUrl'
    }
  });
});

const MONGODB_URI = 'mongodb://instad:bL6oA1zV6iI0cB3yE211222@34.74.181.252:27017/instad';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const VIDEO_CLIPS_COLLECTION = 'video_clips';
const TARGET_BRAND_ID = new ObjectId('682c0015110c28ff637a40a5');

// Get all adTypes (video formats) for the brand
app.get('/api/video-formats', async (req, res) => {
  try {
    const videoGroups = await mongoose.connection.db.collection(VIDEO_CLIPS_COLLECTION).aggregate([
      { $match: { brandId: TARGET_BRAND_ID } },
      { $group: {
        _id: '$videoInfo.url',
        clips: { $push: '$$ROOT' },
        adTypes: { $addToSet: '$analysis.adType' }
      }},
      { $addFields: {
        adTypeCounts: {
          $map: {
            input: {
              $filter: {
                input: '$adTypes',
                as: 'adType',
                cond: { $and: [ { $ne: ['$$adType', null] }, { $ne: ['$$adType', ''] } ] }
              }
            },
            as: 'adType',
            in: {
              adType: '$$adType',
              count: {
                $size: {
                  $filter: {
                    input: '$clips',
                    as: 'clip',
                    cond: { $eq: ['$$clip.analysis.adType', '$$adType'] }
                  }
                }
              }
            }
          }
        }
      }},
      { $addFields: {
        dominantAdType: {
          $reduce: {
            input: { $sortArray: { input: '$adTypeCounts', sortBy: { count: -1, adType: 1 } } },
            initialValue: { adType: null, count: 0 },
            in: {
              $cond: {
                if: { $gt: ['$$this.count', '$$value.count'] },
                then: { adType: '$$this.adType', count: '$$this.count' },
                else: {
                  $cond: {
                    if: { $and: [ { $eq: ['$$this.count', '$$value.count'] }, { $lt: ['$$this.adType', '$$value.adType'] } ] },
                    then: { adType: '$$this.adType', count: '$$this.count' },
                    else: '$$value'
                  }
                }
              }
            }
          }
        }
      }},
      { $group: {
        _id: '$dominantAdType.adType',
        videoCount: { $sum: 1 }
      }},
      { $sort: { videoCount: -1 } }
    ]).toArray();

    const formats = videoGroups.filter(f => f._id && f._id !== '').map((f, idx) => ({
      id: idx + 1,
      format: f._id,
      videoCount: f.videoCount
    }));
    res.json(formats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all videos for a given adType (video format) - grouped by dominant ad type
app.get('/api/videos/format/:format', async (req, res) => {
  try {
    const format = req.params.format;
    const videoGroups = await mongoose.connection.db.collection(VIDEO_CLIPS_COLLECTION).aggregate([
      { $match: { brandId: TARGET_BRAND_ID } },
      { $group: {
        _id: '$videoInfo.url',
        clips: { $push: '$$ROOT' },
        adTypes: { $addToSet: '$analysis.adType' }
      }},
      { $addFields: {
        adTypeCounts: {
          $map: {
            input: {
              $filter: {
                input: '$adTypes',
                as: 'adType',
                cond: { $and: [ { $ne: ['$$adType', null] }, { $ne: ['$$adType', ''] } ] }
              }
            },
            as: 'adType',
            in: {
              adType: '$$adType',
              count: {
                $size: {
                  $filter: {
                    input: '$clips',
                    as: 'clip',
                    cond: { $eq: ['$$clip.analysis.adType', '$$adType'] }
                  }
                }
              }
            }
          }
        }
      }},
      { $addFields: {
        dominantAdType: {
          $reduce: {
            input: { $sortArray: { input: '$adTypeCounts', sortBy: { count: -1, adType: 1 } } },
            initialValue: { adType: null, count: 0 },
            in: {
              $cond: {
                if: { $gt: ['$$this.count', '$$value.count'] },
                then: { adType: '$$this.adType', count: '$$this.count' },
                else: {
                  $cond: {
                    if: { $and: [ { $eq: ['$$this.count', '$$value.count'] }, { $lt: ['$$this.adType', '$$value.adType'] } ] },
                    then: { adType: '$$this.adType', count: '$$this.count' },
                    else: '$$value'
                  }
                }
              }
            }
          }
        }
      }},
      { $match: { 'dominantAdType.adType': format } },
      { $project: {
        videoUrl: '$_id',
        clips: {
          $map: {
            input: '$clips',
            as: 'clip',
            in: {
              _id: '$$clip._id',
              sno: '$$clip.sno',
              audioText: '$$clip.audioText',
              url: '$$clip.url',
              videoInfoUrl: '$$clip.videoInfo.url',
              adType: '$$clip.analysis.adType',
              visualDescription: '$$clip.analysis.visualDescription',
              duration: '$$clip.duration',
              startTime: '$$clip.startTime',
              endTime: '$$clip.endTime',
              confidence: '$$clip.analysis.confidence',
              tags: '$$clip.analysis.tags',
              emotions: '$$clip.analysis.emotions',
              objects: '$$clip.analysis.objects',
              scenes: '$$clip.analysis.scenes'
            }
          }
        },
        totalClips: { $size: '$clips' }
      }}
    ]).toArray();

    res.json(videoGroups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all clips for a specific whole video URL
app.get('/api/videos/whole-video/:videoUrl', async (req, res) => {
  try {
    const videoUrl = decodeURIComponent(req.params.videoUrl);
    
    // Use aggregation to calculate dominant ad type
    const videoGroups = await mongoose.connection.db.collection(VIDEO_CLIPS_COLLECTION).aggregate([
      { $match: { 
        brandId: TARGET_BRAND_ID, 
        'videoInfo.url': videoUrl 
      }},
      { $group: {
        _id: '$videoInfo.url',
        clips: { $push: '$$ROOT' },
        adTypes: { $addToSet: '$analysis.adType' }
      }},
      { $addFields: {
        adTypeCounts: {
          $map: {
            input: {
              $filter: {
                input: '$adTypes',
                as: 'adType',
                cond: { $and: [ { $ne: ['$$adType', null] }, { $ne: ['$$adType', ''] } ] }
              }
            },
            as: 'adType',
            in: {
              adType: '$$adType',
              count: {
                $size: {
                  $filter: {
                    input: '$clips',
                    as: 'clip',
                    cond: { $eq: ['$$clip.analysis.adType', '$$adType'] }
                  }
                }
              }
            }
          }
        }
      }},
      { $addFields: {
        dominantAdType: {
          $reduce: {
            input: { $sortArray: { input: '$adTypeCounts', sortBy: { count: -1, adType: 1 } } },
            initialValue: { adType: null, count: 0 },
            in: {
              $cond: {
                if: { $gt: ['$$this.count', '$$value.count'] },
                then: { adType: '$$this.adType', count: '$$this.count' },
                else: {
                  $cond: {
                    if: { $and: [ { $eq: ['$$this.count', '$$value.count'] }, { $lt: ['$$this.adType', '$$value.adType'] } ] },
                    then: { adType: '$$this.adType', count: '$$this.count' },
                    else: '$$value'
                  }
                }
              }
            }
          }
        }
      }},
      { $project: {
        wholeVideoUrl: '$_id',
        clips: {
          $map: {
            input: '$clips',
            as: 'clip',
            in: {
              _id: '$$clip._id',
              sno: '$$clip.sno',
              audioText: '$$clip.audioText',
              url: '$$clip.url',
              videoInfoUrl: '$$clip.videoInfo.url',
              adType: '$$clip.analysis.adType',
              contentCategory: '$$clip.analysis.contentCategory',
              visualDescription: '$$clip.analysis.visualDescription',
              duration: '$$clip.duration',
              start: '$$clip.start',
              end: '$$clip.end',
              confidence: '$$clip.analysis.confidence',
              tags: '$$clip.analysis.tags',
              emotions: '$$clip.analysis.emotions',
              objects: '$$clip.analysis.objects',
              scenes: '$$clip.analysis.scenes'
            }
          }
        },
        totalClips: { $size: '$clips' },
        adType: '$dominantAdType.adType'
      }}
    ]).toArray();
    
    if (videoGroups.length === 0) {
      return res.status(404).json({ message: 'No clips found for this video' });
    }
    
    const videoData = videoGroups[0];
    videoData.adType = videoData.adType || 'Unknown';
    
    res.json(videoData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all clips for the brand (for dashboard default view)
app.get('/api/videos', async (req, res) => {
  try {
    const clips = await mongoose.connection.db.collection(VIDEO_CLIPS_COLLECTION)
      .find({ brandId: TARGET_BRAND_ID })
      .project({
        _id: 1,
        sno: 1,
        audioText: 1,
        url: 1,
        'videoInfo.url': 1,
        'analysis.adType': 1
      })
      .sort({ sno: 1 })
      .toArray();
    res.json(clips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single clip by _id
app.get('/api/videos/:id', async (req, res) => {
  try {
    const clip = await mongoose.connection.db.collection(VIDEO_CLIPS_COLLECTION)
      .findOne({ _id: new ObjectId(req.params.id), brandId: TARGET_BRAND_ID }, {
        projection: {
          _id: 1,
          sno: 1,
          audioText: 1,
          url: 1,
          'videoInfo.url': 1,
          'analysis.adType': 1
        }
      });
    if (!clip) return res.status(404).json({ message: 'Clip not found' });
    res.json(clip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      message: 'Frontend not built. Please run npm run build first.',
      error: 'dist/index.html not found'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 