import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import VideoPlayer from './pages/VideoPlayer'
import Storyboard from './pages/Storyboard'
import VideoList from './pages/VideoList'
import VideoAnalysis from './pages/VideoAnalysis'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/video/:id" element={<VideoPlayer />} />
          <Route path="/video/:id/storyboard" element={<Storyboard />} />
          <Route path="/videos" element={<VideoList />} />
          <Route path="/analysis" element={<VideoAnalysis />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App 