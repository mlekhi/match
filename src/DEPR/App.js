import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login'; // Your login component
import MatchGraph from './MatchGraph'; // Your MatchGraph component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/match-graph" element={<MatchGraph />} /> {/* No path parameters */}
      </Routes>
    </Router>
  );
}

export default App;
