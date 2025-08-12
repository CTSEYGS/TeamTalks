import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UnansweredQuestionsSidebar from './UnansweredQuestionsSidebar';
import './AddQuestion.css';

const AddQuestion = () => {
  const [title, setTitle] = useState('');
  const [answer, setAnswer] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true); // Expanded by default
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please fill in the question field.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          answer: answer.trim(),
          author: author.trim(),
        }),
      });

      if (response.ok) {
        // Reset form
        setTitle('');
        setAnswer('');
        setAuthor('');
        // Redirect to home page
        navigate('/');
      } else {
        alert('Failed to save the question. Please try again.');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      alert('An error occurred while saving the question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-question-page-layout">
      <div className="add-question-container">
        <div className="add-question-content">
          <div className="add-question-title">Add New Question</div>
          
          <form onSubmit={handleSubmit} className="add-question-form">
            <div className="form-group">
              <label htmlFor="title">Question<span className='question-star'>*</span></label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your question here..."
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="answer">Answer</label>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter the answer here (leave blank if you don't know the answer yet)..."
                rows="6"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Your Name</label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter your name (will be shown as contributor)..."
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/')}
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Question'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <UnansweredQuestionsSidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
      />
    </div>
  );
};

export default AddQuestion;
