import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Question.css';
import Answer from './Answer';

const Question = () => {
  const location = useLocation();
  const question = location.state;

  if (!question) {
    return (
      <div className="question-container">
        <div className="question-content">
          <div className="not-found">Question not found.</div>
          <div className="question-actions">
            <Link to="/" className="back-btn">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  // Support multiple answers (array or single string)
  const answers = Array.isArray(question.answer) ? question.answer : [{ text: question.answer, user: 'Anonymous', date: '', upvotes: 0 }];
  const [upvotes, setUpvotes] = useState(answers.map(a => a.upvotes || 0));

  const handleUpvote = idx => {
    const newUpvotes = [...upvotes];
    newUpvotes[idx] += 1;
    setUpvotes(newUpvotes);
  };

  return (
    <div className="question-container">
      <div className="question-content">
        <div className="question-title">{question.title}</div>
        <div className="answers-section">
          {answers.map((ans, idx) => (
            <Answer
              key={idx}
              answer={ans}
              upvotes={upvotes[idx]}
              onUpvote={() => handleUpvote(idx)}
            />
          ))}
        </div>
        <div className="question-actions">
          <Link to="/" className="back-btn">Back to Search</Link>
        </div>
      </div>
    </div>
  );
};

export default Question;
