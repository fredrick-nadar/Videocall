import {Route,BrowserRouter as Router, Routes} from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import VideoMeet from './pages/VideoMeet.jsx';
import Home from './pages/Home.jsx';
import History from './pages/History.jsx';

const PORT = process.env.PORT || 8000;


function App() {
  return (
    <>
    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/:url" element={<VideoMeet />} />
        <Route path="/history" element={<History />} />
      </Routes>
      </AuthProvider>
    </Router>
    </>
  );
}

export default App;
