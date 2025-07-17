const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = 'mongodb://instad:bL6oA1zV6iI0cB3yE211222@34.74.181.252:27017';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Video Schema
const videoSchema = new mongoose.Schema({
  id: String,
  title: String,
  creator: {
    name: String,
    handle: String,
    avatar: String
  },
  hashtags: String,
  metrics: {
    views: String,
    likes: String,
    comments: String,
    shares: String,
    saves: String,
    sales: String
  },
  thumbnail: String,
  duration: String,
  scripts: [{
    time: String,
    content: String
  }],
  storyboard: [{
    clip: String,
    time: String,
    scene: String,
    shootingTechnique: String,
    visualContent: String
  }],
  format: String,
  brand: String,
  date: String,
  caption: String,
  gmv: String
});

const Video = mongoose.model('Video', videoSchema);

// Sample data
const sampleVideos = [
  {
    id: "1",
    title: "Is the VIRAL @tarte cosmetics lights camera lashes platinum mascara Jeffree Star Approved?!",
    creator: {
      name: "Jeffree Star",
      handle: "@jeffreestar",
      avatar: "https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=JS"
    },
    hashtags: "#jeffreestar #makeupreview #mascara #tarte #beautytips #makeup #fyp #duet w @lex",
    metrics: {
      views: "6500000",
      likes: "262000",
      comments: "2900",
      shares: "17000",
      saves: "937",
      sales: "182000"
    },
    thumbnail: "https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=Video+1",
    duration: "2:52",
    format: "Split-Screen Product Reaction & Demo",
    brand: "Brand 1",
    date: "1-10",
    caption: "Is the VIRAL @tarte cosmetics lights camera lashes platinum...",
    gmv: "182000",
    scripts: [
      {
        time: "0:00 - 0:29",
        content: "Introduces Tarte's new mascara with built-in lash serum, its effect on lashes, and its retail price ($28)."
      },
      {
        time: "0:29 - 0:57",
        content: "Describes the mascara's properties (serum, volume, length, curl, instant lift, 24-hour smudge-proof, flake-free, ultra-black pigment, vitamins b5 and e) and the brush/component design."
      },
      {
        time: "0:57 - 1:18",
        content: "Details the application of the first coat of mascara."
      },
      {
        time: "1:19 - 1:45",
        content: "Describes the application of the second coat, highlighting the 'big difference' and 'instant results,' and moving to the bottom lashes."
      },
      {
        time: "1:46 - 1:55",
        content: "Further comments on the instant lash effect and thickness."
      },
      {
        time: "1:56 - 2:24",
        content: "Expresses reaction to the mascara's performance and describes the silver packaging, comparing it to 'Silver Surfer's tampon' while noting its sleek and cute design."
      }
    ],
    storyboard: [
      {
        clip: "Clip 1",
        time: "0:00s - 0:07s",
        scene: "introduction",
        shootingTechnique: "close-up",
        visualContent: "A woman applies mascara to one eye, showcasing a clear comparison between lashes with and without the product, while holding the mascara tube in her hand."
      },
      {
        clip: "Clip 2",
        time: "0:07s - 0:29s",
        scene: "product introduction",
        shootingTechnique: "medium shot",
        visualContent: "Jeffree Star introduces the mascara with a star shaped mirror in hand, showing the product's packaging and revealing the price."
      },
      {
        clip: "Clip 3",
        time: "0:29s - 0:57s",
        scene: "product details",
        shootingTechnique: "close-up",
        visualContent: "The presenter shows the design of the mascara tube, emphasizing the brush while listing the claimed benefits and features."
      },
      {
        clip: "Clip 4",
        time: "0:57s - 1:18s",
        scene: "application",
        shootingTechnique: "close-up",
        visualContent: "The presenter applies mascara, showing the effect of one coat, then adds a second coat, directly providing feedback during application."
      },
      {
        clip: "Clip 5",
        time: "1:19s - 1:45s",
        scene: "application",
        shootingTechnique: "close-up",
        visualContent: "The presenter applies the mascara on the other eye and then on the bottom lashes, expressing surprise at how well it works."
      },
      {
        clip: "Clip 6",
        time: "1:46s - 1:55s",
        scene: "application",
        shootingTechnique: "close-up",
        visualContent: "The presenter displays the lashes, highlighting their instant fullness and the quick coating effect of the product."
      },
      {
        clip: "Clip 7",
        time: "1:56s - 2:52s",
        scene: "product review & promotion",
        shootingTechnique: "medium shot",
        visualContent: "The presenter compares the Tarte mascara with a House Labs product, emphasizing the unique features of the Tarte mascara, and promoting its availability on TikTok Shop."
      }
    ]
  },
  {
    id: "2",
    title: "@tarte cosmetics #tartelettetubingmasc",
    creator: {
      name: "Kinsy Bell",
      handle: "@kinsylbell",
      avatar: "https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=KB"
    },
    hashtags: "#tarte #mascara #beauty #makeup",
    metrics: {
      views: "382",
      likes: "3",
      comments: "0",
      shares: "0",
      saves: "0",
      sales: "56"
    },
    thumbnail: "https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=Video+2",
    duration: "1:30",
    format: "Split-Screen Product Reaction & Demo",
    brand: "Brand 1",
    date: "3-23",
    caption: "@tarte cosmetics #tartelettetubingmasc...",
    gmv: "56",
    scripts: [
      {
        time: "0:00 - 0:45",
        content: "Introduction to the Tarte tubing mascara and its benefits."
      },
      {
        time: "0:45 - 1:30",
        content: "Application demonstration and final results."
      }
    ],
    storyboard: [
      {
        clip: "Clip 1",
        time: "0:00s - 0:45s",
        scene: "introduction",
        shootingTechnique: "close-up",
        visualContent: "Creator introduces the Tarte tubing mascara product."
      },
      {
        clip: "Clip 2",
        time: "0:45s - 1:30s",
        scene: "application",
        shootingTechnique: "close-up",
        visualContent: "Application process and final lash results."
      }
    ]
  },
  {
    id: "3",
    title: "THE mascara!! @tarte cosmetics Platinum Mascara",
    creator: {
      name: "K Faye",
      handle: "@kfaye_official",
      avatar: "https://via.placeholder.com/60x60/45B7D1/FFFFFF?text=KF"
    },
    hashtags: "#tarte #platinummascara #beauty #makeup",
    metrics: {
      views: "905",
      likes: "16",
      comments: "1",
      shares: "1",
      saves: "2",
      sales: "56"
    },
    thumbnail: "https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=Video+3",
    duration: "2:15",
    format: "Split-Screen Product Reaction & Demo",
    brand: "Brand 1",
    date: "1-15",
    caption: "THE mascara!! @tarte cosmetics Platinum Mascara",
    gmv: "56",
    scripts: [
      {
        time: "0:00 - 1:00",
        content: "Excitement about the Tarte Platinum Mascara and its features."
      },
      {
        time: "1:00 - 2:15",
        content: "Before and after comparison showing dramatic results."
      }
    ],
    storyboard: [
      {
        clip: "Clip 1",
        time: "0:00s - 1:00s",
        scene: "product introduction",
        shootingTechnique: "medium shot",
        visualContent: "Creator expresses excitement about the Platinum Mascara."
      },
      {
        clip: "Clip 2",
        time: "1:00s - 2:15s",
        scene: "comparison",
        shootingTechnique: "close-up",
        visualContent: "Before and after comparison of lash application."
      }
    ]
  }
];

// Populate database
async function populateDatabase() {
  try {
    // Clear existing data
    await Video.deleteMany({});
    console.log('Cleared existing data');

    // Insert new data
    const result = await Video.insertMany(sampleVideos);
    console.log(`Inserted ${result.length} videos`);

    // Close connection
    mongoose.connection.close();
    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
    mongoose.connection.close();
  }
}

populateDatabase(); 