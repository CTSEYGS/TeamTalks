import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Question.css';
import Answer from './Answer';

const Question = () => {
  const location = useLocation();
  const question = location.state;

  const [questionUpvotes, setQuestionUpvotes] = useState(question?.upvotes || 0);
  const [isUpvotingQuestion, setIsUpvotingQuestion] = useState(false);

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
  const answers = Array.isArray(question.answers) ? question.answers : 
                  Array.isArray(question.answer) ? question.answer :
                  [{ text: question.answer || question.answers, user: 'Anonymous', date: '', upvotes: 0 }];

  // Handle question upvote
  const handleQuestionUpvote = async () => {
    if (isUpvotingQuestion) return;

    setIsUpvotingQuestion(true);
    
    try {
      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'update_field',
          field: 'upvotes',
          value: questionUpvotes + 1
        })
      });

      if (response.ok) {
        const result = await response.json();
        setQuestionUpvotes(questionUpvotes + 1);
        console.log(`Question ${question.id} upvoted successfully`);
      } else {
        const error = await response.json();
        console.error('Failed to upvote question:', error.error);
        alert('Failed to upvote question: ' + error.error);
      }
    } catch (error) {
      console.error('Error upvoting question:', error);
      alert('Error upvoting question. Please try again.');
    } finally {
      setIsUpvotingQuestion(false);
    }
  };

  return (
    <div className="question-container">
      <div className="question-content">
        
        {/* Question Header */}
        <div className="question-header">
          <div className="question-title2">{question.title} </div>
          
          {/* Question Metadata */}
          <div className="question-meta">
            <div className="question-info">
              <span className="question-author">By {question.author || 'Anonymous'}</span>
              <span className="question-date">{question.createdDateDisplay || question.createdDate || 'Unknown date'}</span>
              <span className="question-id">ID: {question.id}</span>
            </div>
            
            {/* Question Upvote Section */}
            <div className="question-upvote">
              <button 
                onClick={handleQuestionUpvote} 
                className={`question-upvote-btn ${isUpvotingQuestion ? 'upvoting' : ''}`}
                disabled={isUpvotingQuestion}
                title="Upvote this question"
              >
                {isUpvotingQuestion ? '' : '👍'}
              </button>
              <span className="question-upvote-count">{questionUpvotes}</span>
            </div>
          </div>

          {/* Tags Section */}
          {question.tags && question.tags.length > 0 && (
            <div className="question-tags">
              {question.tags.map((tag, index) => (
                <span key={index} className="question-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Answers Section */}
        <div className="answers-section">
           <div className='answers-title'>Answers</div> 
       
          {answers.length > 0 ? (
            answers.map((ans, idx) => (
              <Answer
                key={ans.answerid || idx}
                answer={ans}
                questionId={question.id}
                onUpvote={(answerId, newCount) => {
                  console.log(`Answer ${answerId} now has ${newCount} upvotes`);
                }}
              />
            ))
          ) : (
            <div className="no-answers">
              <p>No answers yet. Be the first to answer!</p>
            </div>
          )}
        </div>

        {/* Question Actions */}
        <div className="question-actions">
          <Link to="/" className="back-btn">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Question;