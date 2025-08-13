import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Question.css';
import Answer from './Answer';
import AddAnswerModal from './AddAnswerModal';
import { useNavigate } from 'react-router-dom'; // Add useNavigate here

const Question = () => {
  const location = useLocation();
  const question = location.state;
  const navigate = useNavigate(); // Initialize useNavigate

  const [questionUpvotes, setQuestionUpvotes] = useState(question?.upvotes || 0);
  const [isUpvotingQuestion, setIsUpvotingQuestion] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [questionData, setQuestionData] = useState(question);
const [isAddingTag, setIsAddingTag] = useState(false);
const [newTagText, setNewTagText] = useState('');

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

const handleAddTag = async () => {
  if (!newTagText.trim()) return;
  
  const newTag = newTagText.trim().toLowerCase();
  
  try {
    const response = await fetch(`/api/questions/${questionData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation: 'add_tag',  // Using the new operation type
        value: newTag          // Just the tag value
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      // Update local state with the returned tags
      setQuestionData({
        ...questionData,
        tags: result.allTags
      });
      setIsAddingTag(false);
      setNewTagText('');
      console.log(`Tag "${result.newTag}" added successfully. Total tags: ${result.tagCount}`);
    } else {
      const error = await response.json();
      console.error('Failed to add tag:', error.error);
      alert('Failed to add tag: ' + error.error);
    }
  } catch (error) {
    console.error('Error adding tag:', error);
    alert('Error adding tag. Please try again.');
  }
};

// Add this function to handle canceling tag addition
const handleCancelAddTag = () => {
  setIsAddingTag(false);
  setNewTagText('');
};

// Add this function to handle Enter key
const handleTagKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleAddTag();
  } else if (e.key === 'Escape') {
    handleCancelAddTag();
  }
};

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
                <span 
                  className="question-author clickable"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/filtered/author/${encodeURIComponent(questionData.author || 'Anonymous')}`);
                  }}
                  title={`View all questions by ${questionData.author || 'Anonymous'}`}
                  style={{ cursor: 'pointer' }}
                >
                  By {questionData.author || 'Anonymous'}
                </span>
                <span className="question-date">{questionData.createdDateDisplay || questionData.createdDate || 'Unknown date'}</span>
              <span className="question-id">ID: {questionData.id}</span>
              {/* Add tags here */}
        {/* Replace your existing question-tags-inline section with this: */}
{(questionData.tags && questionData.tags.length > 0) || isAddingTag ? (
  <div className="question-tags-section">
    
    <div className="tags-container">
      {/* Existing tags */}
     {questionData.tags && questionData.tags.map((tag, index) => (
  <span 
    key={index} 
    className="question-tag-pill clickable"
    onClick={() => navigate(`/filtered/tag/${tag}`)}
    style={{ cursor: 'pointer' }}
    title={`View all questions tagged with "${tag}"`}
  >
    {tag}
  </span>
))}
      
      {/* Add tag input */}
      {isAddingTag ? (
        <div className="add-tag-input-container">
          <input
            type="text"
            value={newTagText}
            onChange={(e) => setNewTagText(e.target.value)}
            onKeyPress={handleTagKeyPress}
            placeholder="Enter tag..."
            className="add-tag-input"
            autoFocus
          />
          <button 
            onClick={handleAddTag} 
            className="add-tag-save-btn"
            disabled={!newTagText.trim()}
          >
            ✓
          </button>
          <button 
            onClick={handleCancelAddTag} 
            className="add-tag-cancel-btn"
          >
            ✕
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setIsAddingTag(true)} 
          className="add-tag-btn"
          title="Add new tag"
        >
          + Add Tag
        </button>
      )}
    </div>
  </div>
) : (
  <div className="question-tags-section">
    <span className="tags-label">Tags:</span>
    <button 
      onClick={() => setIsAddingTag(true)} 
      className="add-tag-btn"
      title="Add first tag"
    >
      + Add Tag
    </button>
  </div>
)}
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