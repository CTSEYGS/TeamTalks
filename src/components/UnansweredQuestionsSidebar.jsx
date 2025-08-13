import React, { useState, useEffect } from 'react';
import './UnansweredQuestionsSidebar.css';
import AddAnswerModal from './AddAnswerModal';

function UnansweredQuestionsSidebar({ 
  isExpanded, 
  onToggle, 
  onQuestionUpdate = null 
}) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestionToAnswer, setSelectedQuestionToAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

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
    if (typeof q.answers === 'string') {
      return q.answers === "No answer provided yet. Feel free to contribute an answer!";
    }
    if (Array.isArray(q.answers) && q.answers.length === 1) {
      return q.answers[0].text === "No answer provided yet. Feel free to contribute an answer!";
    }
    if (Array.isArray(q.answers) && q.answers.length === 0) {
      return true;
    }
    return false;
  });

  const handleSelectQuestion = (questionToAnswer) => {
    setSelectedQuestionToAnswer(questionToAnswer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedQuestionToAnswer(null);
    setIsModalOpen(false);
  };

  const handleAnswerSubmitted = async (questionId, answerText) => {
    // Refresh the questions data
    await fetchQuestions();
    
    // Notify parent component if callback provided
    if (onQuestionUpdate) {
      onQuestionUpdate();
    }
    
    console.log(`Answer submitted for question ${questionId}`);
  };

  return (
    <>
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

     
    </div>
     {/* Add Answer Modal */}
      <AddAnswerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        question={selectedQuestionToAnswer}
        onAnswerSubmitted={handleAnswerSubmitted}
      />
      </>
  );
}

export default UnansweredQuestionsSidebar;
