import {Route,BrowserRouter as Router, Routes} from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
