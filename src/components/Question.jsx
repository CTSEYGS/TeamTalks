import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Question.css';
import Answer from './Answer';
import AddAnswerModal from './AddAnswerModal';

const Question = () => {
  const location = useLocation();
  const question = location.state;

  const [questionUpvotes, setQuestionUpvotes] = useState(question?.upvotes || 0);
  const [isUpvotingQuestion, setIsUpvotingQuestion] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [questionData, setQuestionData] = useState(question);

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
  const answers = Array.isArray(questionData.answers) ? questionData.answers : 
                  Array.isArray(questionData.answer) ? questionData.answer :
                  typeof questionData.answer === 'string' && 
                  questionData.answer !== "No answer provided yet. Feel free to contribute an answer!" ?
                  [{ text: questionData.answer, user: 'Anonymous', date: '', upvotes: 0 }] : [];

  const hasNoAnswers = answers.length === 0 || 
    (answers.length === 1 && answers[0].text === "No answer provided yet. Feel free to contribute an answer!");

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

  // Handle answer submission
  const handleAnswerSubmitted = async (questionId, answerText) => {
    try {
      // Refresh question data by fetching it again
      const response = await fetch(`/api/questions/${questionId}`);
      if (response.ok) {
        const updatedQuestion = await response.json();
        setQuestionData(updatedQuestion);
      }
      console.log('Answer submitted successfully');
    } catch (error) {
      console.error('Error refreshing question data:', error);
    }
  };

  return (
    <div className="question-container">
      <div className="question-content">
        
        {/* Question Header */}
        <div className="question-header">
          <div className="question-title2">{questionData.title}</div>
          
          {/* Question Metadata */}
          <div className="question-meta">
            <div className="question-info">
              <span className="question-author">By {questionData.author || 'Anonymous'}</span>
              <span className="question-date">{questionData.createdDateDisplay || questionData.createdDate || 'Unknown date'}</span>
              <span className="question-id">ID: {questionData.id}</span>
            </div>
            
            {/* Question Upvote Section */}
            <div className="question-upvote">
              <button 
                onClick={handleQuestionUpvote} 
                className={`question-upvote-btn ${isUpvotingQuestion ? 'upvoting' : ''}`}
                disabled={isUpvotingQuestion}
                title="Upvote this question"
              >
                {isUpvotingQuestion ? '⏳' : '👍'}
              </button>
              <span className="question-upvote-count">{questionUpvotes}</span>
            </div>
          </div>

          {/* Tags Section */}
          {questionData.tags && questionData.tags.length > 0 && (
            <div className="question-tags">
              {questionData.tags.map((tag, index) => (
                <span key={index} className="question-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Answers Section */}
        <div className="answers-section">
          <div className="answers-header">
            Answers
          </div>
          
          {hasNoAnswers ? (
            <div className="no-answers">
              <div className="no-answers-content">
                <p>No answers yet. Be the first to answer!</p>
                <button 
                  className="add-answer-btn" 
                  onClick={() => setIsAnswerModalOpen(true)}
                >
                  💡 Add Your Answer
                </button>
              </div>
            </div>
          ) : (
            <>
              {answers.map((ans, idx) => (
                <Answer
                  key={ans.answerid || idx}
                  answer={ans}
                  questionId={questionData.id}
                  onUpvote={(answerId, newCount) => {
                    console.log(`Answer ${answerId} now has ${newCount} upvotes`);
                  }}
                />
              ))}
              
              {/* Add Answer Button for existing answers */}
              <div className="add-more-answers">
                <button 
                  className="add-answer-btn secondary" 
                  onClick={() => setIsAnswerModalOpen(true)}
                >
                  ➕ Add Another Answer
                </button>
              </div>
            </>
          )}
        </div>

        {/* Question Actions */}
        <div className="question-actions">
          <Link to="/" className="back-btn">← Back to Home</Link>
        </div>
      </div>

      {/* Add Answer Modal */}
      <AddAnswerModal
        isOpen={isAnswerModalOpen}
        onClose={() => setIsAnswerModalOpen(false)}
        question={questionData}
        onAnswerSubmitted={handleAnswerSubmitted}
      />
    </div>
  );
};

export default Question;