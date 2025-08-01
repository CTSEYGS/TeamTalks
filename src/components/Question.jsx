import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Home.css';

const Question = () => {
  const location = useLocation();
  const question = location.state;

  if (!question) {
    return (
      <div className="home-container">
        <div className="center-content">
          <div>Question not found.</div>
          <Link to="/" className="search-btn" style={{ marginTop: 24 }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="center-content">
        <h2 style={{ margin: '24px 0 12px 0', textAlign: 'center' }}>{question.title}</h2>
        <p style={{ fontSize: '1.15rem', textAlign: 'center', maxWidth: 600 }}>{question.answer}</p>
        <Link to="/" className="search-btn" style={{ marginTop: 32 }}>Back to Search</Link>
      </div>
    </div>
  );
};

export default Question;