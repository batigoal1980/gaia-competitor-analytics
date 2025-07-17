# Video Analytics Dashboard

A comprehensive video analytics platform for competitor analysis, featuring video performance metrics, detailed insights, storyboarding, and script analysis.

## Features

### 🎯 Main Dashboard
- **Video Format Analytics**: Track performance of different video formats with rankings and medals
- **Industry Filtering**: Filter data by industry (Beauty & Personal Care, Fashion, Technology, etc.)
- **Time-based Filtering**: View data for 7 days, 30 days, 90 days, or all time
- **Performance Metrics**: Total views, likes, shares, GMV (Gross Merchandise Value), and video count
- **Top Performing Videos**: Grid view of individual videos with key metrics

### 📊 Individual Video Analysis
- **Video Player**: Embedded video player with duration display
- **Creator Information**: Detailed creator profile with avatar and handle
- **Performance Metrics**: Comprehensive analytics including views, likes, comments, shares, saves, and sales
- **Script Analysis**: Timestamped script breakdown with copy functionality
- **Navigation**: Easy access to storyboard view

### 🎬 Video Storyboard
- **Clip Breakdown**: Video segmented into individual clips with thumbnails
- **Timeline Tracking**: Precise timestamps for each clip
- **Scene Classification**: Categorization of each clip's purpose (introduction, product details, application, etc.)
- **Shooting Techniques**: Camera shot types (close-up, medium shot, etc.)
- **Visual Content**: Detailed descriptions of what happens in each clip

### 📋 Video List
- **Comprehensive View**: All videos with detailed metrics
- **Search & Filter**: Advanced filtering and search capabilities
- **Summary Statistics**: Aggregated performance metrics
- **Grid Layout**: Responsive grid display of video cards

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout with navigation
│   └── VideoCard.jsx       # Individual video card component
├── pages/
│   ├── Dashboard.jsx       # Main dashboard with video formats
│   ├── VideoPlayer.jsx     # Individual video analysis
│   ├── Storyboard.jsx      # Video storyboard breakdown
│   └── VideoList.jsx       # Comprehensive video list
├── App.jsx                 # Main app with routing
├── main.jsx               # React entry point
└── index.css              # Global styles and Tailwind imports
```

## Key Features Implemented

### 1. **Ad Type to Single Ad Flow**
- Dashboard shows video format performance (ad types)
- Click on individual videos to see detailed analysis
- Seamless navigation between overview and specific content

### 2. **Script Analysis**
- Timestamped script breakdown
- Copy functionality for easy sharing
- Detailed content descriptions for each segment

### 3. **Clip Features**
- Video storyboard with individual clip analysis
- Timeline tracking for precise content mapping
- Scene classification and shooting technique identification
- Visual content descriptions for each clip

### 4. **Performance Metrics**
- Comprehensive analytics dashboard
- GMV tracking for revenue analysis
- Engagement metrics (views, likes, shares, comments, saves)
- Creator performance tracking

## Customization

### Adding New Industries
Edit the `industries` array in the Dashboard and VideoList components:

```javascript
const industries = ['Beauty & Personal Care', 'Fashion', 'Technology', 'Food & Beverage', 'Your New Industry']
```

### Modifying Video Formats
Update the `videoFormats` array in the Dashboard component to add new video format categories.

### Styling
The application uses Tailwind CSS with custom utility classes. Modify `src/index.css` to add new styles or update existing ones.

## Future Enhancements

- **Real-time Data**: Connect to actual video analytics APIs
- **Advanced Filtering**: More granular filtering options
- **Export Functionality**: PDF/CSV export of analytics data
- **User Authentication**: Login system for multiple users
- **Real Video Integration**: Connect to actual video platforms
- **AI-powered Insights**: Automated content analysis and recommendations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 