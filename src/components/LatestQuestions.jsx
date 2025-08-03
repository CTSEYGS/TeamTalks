import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LatestQuestions.css';

const LatestQuestions = ({ questions }) => {
  const navigate = useNavigate();
  
  // Get latest 6 questions based on creation date or ID (newest first)
  const getLatestQuestions = () => {
    return questions
      .sort((a, b) => {
        // Sort by creation date if available, otherwise by ID (descending for newest first)
        if (a.createdDate && b.createdDate) {
          return new Date(b.createdDate) - new Date(a.createdDate);
        }
        return b.id - a.id; // Fallback to ID sorting
      })
      .slice(0, 6);
  };

  const latestQuestions = getLatestQuestions();

  if (latestQuestions.length === 0) {
    return null;
  }

  return (
    <div className="latest-questions-container">
      <h3 className="latest-questions-title">🆕 Latest Questions</h3>
      <div className="latest-questions-pills">
        {latestQuestions.map(question => (
          <button
            key={question.id}
            className="latest-question-pill"
            onClick={() => navigate(`/question/${question.id}`, { state: question })}
          >
            <span className="pill-text">{question.title}</span>
            {question.createdDate && (
              <span className="pill-date">{question.createdDate}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LatestQuestions;
