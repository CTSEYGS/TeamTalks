import React, { useState, useEffect } from 'react';
import './AddAnswerModal.css';

const AddAnswerModal = ({ 
  isOpen, 
  onClose, 
  question, 
  onAnswerSubmitted 
}) => {
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAnswerText('');
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || !question) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/questions/${question.id}`, {
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
        // Call the callback to notify parent component
        if (onAnswerSubmitted) {
          onAnswerSubmitted(question.id, answerText);
        }
        
        // Close modal and reset form
        onClose();
        setAnswerText('');
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

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="answer-modal">
        <div className="modal-header">
          <div className="contribute-answer-title">Contribute your answer</div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-question">
          <h4>Question:</h4>
          <p>{question?.title}</p>
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
              onClick={onClose}
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
  );
};

export default AddAnswerModal;