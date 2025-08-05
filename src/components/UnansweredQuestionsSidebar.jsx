import React, { useState, useEffect } from 'react';
import './UnansweredQuestionsSidebar.css';

function UnansweredQuestionsSidebar({ 
  isExpanded, 
  onToggle, 
  onQuestionUpdate = null 
}) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestionToAnswer, setSelectedQuestionToAnswer] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/knowledgedata');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setAllQuestions(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setLoading(false);
    }
  };

  // Filter questions that need answers
  const unansweredQuestions = allQuestions.filter(q => {
    if (typeof q.answer === 'string') {
      return q.answer === "No answer provided yet. Feel free to contribute an answer!";
    }
    if (Array.isArray(q.answer) && q.answer.length === 1) {
      return q.answer[0].text === "No answer provided yet. Feel free to contribute an answer!";
    }
    return false;
  });

  const handleSelectQuestion = (questionToAnswer) => {
    setSelectedQuestionToAnswer(questionToAnswer);
    setAnswerText('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedQuestionToAnswer(null);
    setAnswerText('');
    setIsModalOpen(false);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || !selectedQuestionToAnswer) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/questions/${selectedQuestionToAnswer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: answerText,
          user: 'Anonymous User',
          date: new Date().toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric' 
          })
        })
      });

      if (response.ok) {
        // Refresh the questions data
        await fetchQuestions();
        
        // Notify parent component if callback provided
        if (onQuestionUpdate) {
          onQuestionUpdate();
        }
        
        setSelectedQuestionToAnswer(null);
        setAnswerText('');
        setIsModalOpen(false);
        alert('Answer submitted successfully!');
      } else {
        throw new Error('Failed to submit answer');
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`unanswered-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="sidebar-toggle" onClick={onToggle}>
        <span className="toggle-text">
          {isExpanded ? 'Hide' : `Unanswered Questions ${loading ? '...' : `(${unansweredQuestions.length})`}`}
        </span>
      </button>

      {isExpanded && (
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3>Unanswered Questions</h3>
            <button className="hide-sidebar-btn" onClick={onToggle}>
              ✕
            </button>
          </div>
          
          <div className="question-count-section">
            <span className="question-count">
              {loading ? '...' : `${unansweredQuestions.length} questions`}
            </span>
          </div>

          {loading ? (
            <div className="loading-state">Loading questions...</div>
          ) : unansweredQuestions.length === 0 ? (
            <div className="no-unanswered">
              <span className="celebration">🎉</span>
              <p>All questions have been answered!</p>
              <small>Great job, community!</small>
            </div>
          ) : (
            <div className="unanswered-list">
              {unansweredQuestions.map(q => (
                <div 
                  key={q.id} 
                  className="unanswered-item"
                  onClick={() => handleSelectQuestion(q)}
                >
                  <h4>{q.title}</h4>
                  <span className="help-text">Click to contribute an answer</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Answer Modal */}
      {isModalOpen && selectedQuestionToAnswer && (
        <>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
          <div className="answer-modal">
            <div className="modal-header">
              <h3>Contribute Your Answer</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            
            <div className="modal-question">
              <h4>Question:</h4>
              <p>{selectedQuestionToAnswer.title}</p>
            </div>

            <form onSubmit={handleSubmitAnswer} className="modal-form">
              <div className="form-group">
                <label htmlFor="answer">Your Answer:</label>
                <textarea
                  id="answer"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Share your knowledge and help the community..."
                  required
                  rows="8"
                  className="modal-textarea"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="modal-cancel-btn"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || !answerText.trim()}
                  className="modal-submit-btn"
                >
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default UnansweredQuestionsSidebar;
