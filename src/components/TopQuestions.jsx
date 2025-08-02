import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TopQuestions.css';

const TopQuestions = ({ questions }) => {
  const navigate = useNavigate();
  
  // Get top 6 questions
  const topQuestions = questions.slice(0, 6);

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
          >
            {question.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopQuestions;
