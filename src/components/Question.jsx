import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Question.css';

const Question = () => {
  const location = useLocation();
  const question = location.state;

  if (!question) {
    return (
      <div className="question-container">
        <div className="question-content">
          <div className="not-found">Question not found.</div>
          <Link to="/" className="back-btn">Back to Home</Link>
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
            <div key={idx} className="answer-box">
              <div
                className="answer-text"
                dangerouslySetInnerHTML={{ __html: ans.text || ans }}
              />
              <div className="answer-meta">
                <span className="answer-user">{ans.user || 'Anonymous'}</span>
                <span className="answer-date">{ans.date || ''}</span>
              </div>
              <div className="answer-upvote">
                <button onClick={() => handleUpvote(idx)} className="upvote-btn">▲ Upvote</button>
                <span className="upvote-count">{upvotes[idx]}</span>
              </div>
            </div>
          ))}
        </div>
        <Link to="/" className="back-btn">Back to Search</Link>
      </div>
    </div>
  );
};

export default Question;