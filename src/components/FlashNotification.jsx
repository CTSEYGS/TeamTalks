import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlashNotification.css';

const FlashNotification = ({ questions }) => {
  const [show, setShow] = useState(false);
  const [flashQuestion, setFlashQuestion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!questions || questions.length === 0) return;

    // Find all flash questions
    const flashQuestions = questions.filter(q => 
      q.tags && 
      Array.isArray(q.tags) && 
      q.tags.some(tag => tag.toLowerCase() === 'flash')
    );

    // If no flash questions, don't show anything
    if (flashQuestions.length === 0) {
      setFlashQuestion(null);
      setShow(false);
      return;
    }

    // Get the latest flash question (highest ID)
    const latestFlash = flashQuestions.reduce((latest, current) => 
      current.id > latest.id ? current : latest
    );

    setFlashQuestion(latestFlash);

    // Show flash notification after 2 seconds
    const showTimer = setTimeout(() => {
      setShow(true);
    }, 2000);

    // Auto hide after 6 seconds
    const hideTimer = setTimeout(() => {
      setShow(false);
    }, 12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [questions]);

  const handleClick = () => {
    if (flashQuestion) {
      navigate(`/question/${flashQuestion.id}`, { state: flashQuestion });
    }
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setShow(false);
  };

  // Don't render if no flash question or not showing
  if (!flashQuestion || !show) return null;

  return (
    <div className={`flash-notification ${show ? 'show' : ''}`} onClick={handleClick}>
      <div className="flash-content">
        <div className="flash-header">
          <span className="flash-icon">⚡</span>
          <span className="flash-label">Flash Update</span>
          <button className="flash-dismiss" onClick={handleDismiss}>✕</button>
        </div>
        <div className="flash-title">{flashQuestion.title}</div>
        <div className="flash-meta">
          <span className="flash-author">By {flashQuestion.author || 'Anonymous'}</span>
          <span className="flash-date">{flashQuestion.createdDateDisplay || flashQuestion.createdDate}</span>
        </div>
      </div>
    </div>
  );
};

export default FlashNotification;