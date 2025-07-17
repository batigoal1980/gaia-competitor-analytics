const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = 'mongodb://instad:bL6oA1zV6iI0cB3yE211222@34.74.181.252:27017/instad';

async function testVideoClips() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully!');

    // Get sample data from video_clips collection with correct brandId
    const sampleData = await mongoose.connection.db.collection('video_clips').findOne({
      brandId: '682c0015110c28ff637a40a5'
    });
    
    if (sampleData) {
      console.log('Sample document structure from video_clips:');
      console.log(JSON.stringify(sampleData, null, 2));
      
      // Get total count for this brand
      const totalCount = await mongoose.connection.db.collection('video_clips').countDocuments({
        brandId: '682c0015110c28ff637a40a5'
      });
      console.log(`\nTotal documents for brandId 682c0015110c28ff637a40a5: ${totalCount}`);
      
      // Check what adType values exist
      const adTypes = await mongoose.connection.db.collection('video_clips').distinct('analysis.adType', {
        brandId: '682c0015110c28ff637a40a5'
      });
      console.log('\nAvailable adType values:', adTypes);
      
    } else {
      console.log('No documents found for brandId 682c0015110c28ff637a40a5');
      
      // Check what brandIds exist
      const brandIds = await mongoose.connection.db.collection('video_clips').distinct('brandId');
      console.log('\nAvailable brandIds:', brandIds.slice(0, 10)); // Show first 10
      
      // Check what adType values exist across all brands
      const allAdTypes = await mongoose.connection.db.collection('video_clips').distinct('analysis.adType');
      console.log('\nAll available adType values:', allAdTypes);
      
      // Get total count
      const totalCount = await mongoose.connection.db.collection('video_clips').countDocuments();
      console.log(`\nTotal documents in video_clips collection: ${totalCount}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
}

testVideoClips(); 