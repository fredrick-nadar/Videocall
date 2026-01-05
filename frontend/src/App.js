import {Route,BrowserRouter as Router, Routes} from 'react-router-dom';
import Landing from './pages/Landing.jsx';

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
