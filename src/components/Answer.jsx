import React from 'react';
import './Answer.css';

const Answer = ({ answer, upvotes, onUpvote }) => {
  return (
    <div className="answer-box">
      <div className="answer-main">
        <div
          className="answer-text"
          dangerouslySetInnerHTML={{ __html: answer.text || answer }}
        />
        <div className="answer-sidebar">
          <div className="answer-meta">
            <span className="answer-user">{answer.user || 'Anonymous'}</span>
            {(answer.date && answer.date.trim()) && (
              <span className="answer-date">{answer.date}</span>
            )}
          </div>
          <div className="answer-upvote">
            <button onClick={onUpvote} className="upvote-btn">
              👍
            </button>
            <span className="upvote-count">{upvotes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Answer;