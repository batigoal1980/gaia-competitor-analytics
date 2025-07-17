const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = 'mongodb://instad:bL6oA1zV6iI0cB3yE211222@34.74.181.252:27017/instad';

async function exploreDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const targetBrandId = new ObjectId('6697820368ee27b6f3ad235a');
    
    // Get a sample of clips to examine all available fields
    const videoClips = db.collection('video_clips');
    const sampleClips = await videoClips.find({ 
      brandId: targetBrandId
    }).limit(3).toArray();
    
    console.log(`\n=== Examining features object in detail ===`);
    
    sampleClips.forEach((clip, index) => {
      console.log(`\n--- Clip ${index + 1} ---`);
      
      if (clip.analysis?.features) {
        console.log('Available features (boolean flags):');
        Object.keys(clip.analysis.features).forEach(key => {
          const value = clip.analysis.features[key];
          console.log(`  ${key}: ${value}`);
        });
      }
      
      if (clip.analysis?.visualElements) {
        console.log('\nVisual elements:');
        Object.keys(clip.analysis.visualElements).forEach(key => {
          const value = clip.analysis.visualElements[key];
          console.log(`  ${key}: ${value}`);
        });
      }
      
      if (clip.analysis?.creator) {
        console.log('\nCreator info:');
        Object.keys(clip.analysis.creator).forEach(key => {
          const value = clip.analysis.creator[key];
          console.log(`  ${key}: ${value}`);
        });
      }
      
      console.log(`\nDuration: ${clip.duration}s`);
      console.log(`Visual Description: ${clip.analysis?.visualDescription || 'N/A'}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

exploreDatabase(); 