import React, { useState } from 'react';
import './Answer.css';

const Answer = ({ answer, questionId, onUpvote }) => {
  const [upvoteCount, setUpvoteCount] = useState(answer.upvotes || 0);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const handleUpvote = async () => {
    if (isUpvoting || !answer.answerid) return;

    setIsUpvoting(true);
    
    try {
      const response = await fetch(`/api/questions/${questionId}/answers/${answer.answerid}/upvote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUpvoteCount(result.newUpvoteCount);
        
        // Call parent callback if provided
        if (onUpvote) {
          onUpvote(answer.answerid, result.newUpvoteCount);
        }
        
        console.log(`Answer ${answer.answerid} upvoted successfully`);
      } else {
        const error = await response.json();
        console.error('Failed to upvote answer:', error.error);
        alert('Failed to upvote answer: ' + error.error);
      }
    } catch (error) {
      console.error('Error upvoting answer:', error);
      alert('Error upvoting answer. Please try again.');
    } finally {
      setIsUpvoting(false);
    }
  };

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
            {/* {answer.answerid && (
              <span className="answer-id">A.ID: {answer.answerid}</span>
            )}
             {questionId && (
              <span className="answer-id">Q.ID: {questionId}</span>
            )} */}
          </div>
          <div className="answer-upvote">
            <button 
              onClick={handleUpvote} 
              className={`upvote-btn ${isUpvoting ? 'upvoting' : ''}`}
              disabled={isUpvoting || !answer.answerid}
              title={!answer.answerid ? 'Cannot upvote - no answer ID' : 'Upvote this answer'}
            >
              {isUpvoting ? '⏳' : '👍'}
            </button>
            <span className="upvote-count">{upvoteCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Answer;