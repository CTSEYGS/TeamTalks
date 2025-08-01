import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Question from './components/Question';
import AddQuestion from './components/AddQuestion';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ paddingTop: 56 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/question/:id" element={<Question />} />
          <Route path="/add-question" element={<AddQuestion />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;