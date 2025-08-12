import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TopQuestions.css';

const TopQuestions = ({ questions }) => {
  const navigate = useNavigate();
  
  // Get top 6 questions based on upvotes (most voted first)
  const getTopQuestions = () => {
    return questions
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)) // Sort by upvotes descending
      .slice(0, 6);
  };

  const topQuestions = getTopQuestions();

  if (topQuestions.length === 0) {
    return null;
  }

  return (
    <div className="top-questions-container">
      <div className="questions-pills">
        {topQuestions.map(question => (
          <button
            key={question.id}
            className="question-pill"
            onClick={() => navigate(`/question/${question.id}`, { state: question })}
            title={`${question.upvotes || 0} upvotes`}
          >
            <span className="question-text">{question.title}</span>
            {/* {(question.upvotes || 0) > 0 && (
              <span className="upvote-badge">{question.upvotes}</span>
            )} */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopQuestions;
