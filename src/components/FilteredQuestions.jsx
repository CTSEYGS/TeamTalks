import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './FilteredQuestions.css';

const FilteredQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { filterType, filterValue } = useParams();

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      filterQuestions();
    }
  }, [questions, filterType, filterValue]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/knowledgedata');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        console.error('Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [];

    switch (filterType) {
 case 'tag':
      filtered = questions.filter(q => {
        if (!q.tags || !Array.isArray(q.tags)) return false;
        
        // Check both original case and lowercase for exact match
        return q.tags.some(tag => 
          tag === filterValue || 
          tag.toLowerCase() === filterValue.toLowerCase()
        );
      });
      break;
      case 'author':
        filtered = questions.filter(q => 
          q.author && q.author.toLowerCase() === filterValue.toLowerCase()
        );
        break;
      case 'date':
        filtered = questions.filter(q => 
          q.createdDateDisplay === filterValue || q.createdDate === filterValue
        );
        break;
      default:
        filtered = questions;
    }

    // Sort by newest first
    filtered.sort((a, b) => b.id - a.id);
    setFilteredQuestions(filtered);
  };

  const handleQuestionClick = (question) => {
    navigate(`/question/${question.id}`, { state: question });
  };

  const handleTagClick = (tag) => {
    if (filterType !== 'tag' || filterValue !== tag) {
      navigate(`/filtered/tag/${tag}`);
    }
  };

  const handleAuthorClick = (author) => {
    if (filterType !== 'author' || filterValue !== author) {
      navigate(`/filtered/author/${author}`);
    }
  };

  const getFilterTitle = () => {
    switch (filterType) {
      case 'tag':
        return `Questions tagged with "${filterValue}"`;
      case 'author':
        return `Questions by ${filterValue}`;
      case 'date':
        return `Questions from ${filterValue}`;
      default:
        return 'All Questions';
    }
  };

  if (loading) {
    return (
      <div className="filtered-questions-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="filtered-questions-container">
      <div className="filtered-questions-content">
        
        {/* Header */}
        <div className="filtered-header">
          <button 
            onClick={() => navigate('/')} 
            className="back-to-home-btn"
          >
            ← Back to Home
          </button>
          <h1 className="filter-title">{getFilterTitle()}</h1>
          <div className="results-count">
            {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No questions found</h3>
            <p>Try adjusting your filter or browse all questions.</p>
            <button 
              onClick={() => navigate('/')} 
              className="browse-all-btn"
            >
              Browse All Questions
            </button>
          </div>
        ) : (
          <div className="questions-list">
            {filteredQuestions.map(question => (
              <div 
                key={question.id} 
                className="question-item"
                onClick={() => handleQuestionClick(question)}
              >
                <div className="question-item-content">
                  
                  {/* Question Title */}
                  <div className="question-item-title">
                    {question.title}
                  </div>

                  {/* Question Meta */}
                  <div className="question-item-meta">
                    <div className="meta-pills">
                      <span 
                        className="author-pill clickable"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAuthorClick(question.author || 'Anonymous');
                        }}
                      >
                        👤 {question.author || 'Anonymous'}
                      </span>
                      
                      <span className="date-pill">
                        📅 {question.createdDateDisplay || question.createdDate || 'Unknown'}
                      </span>
                      
                      <span className="id-pill">
                        ID: {question.id}
                      </span>

                      {question.upvotes > 0 && (
                        <span className="upvotes-pill">
                          👍 {question.upvotes}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {question.tags && question.tags.length > 0 && (
                      <div className="question-item-tags">
                        {question.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className={`tag-pill ${filterType === 'tag' && filterValue === tag ? 'active' : 'clickable'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (filterType !== 'tag' || filterValue !== tag) {
                                handleTagClick(tag);
                              }
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Answer Count */}
                  <div className="question-item-footer">
                    <span className="answer-count">
                      {Array.isArray(question.answers) ? question.answers.length : 
                       Array.isArray(question.answer) ? question.answer.length : 
                       question.answer ? 1 : 0} answer{
                        (Array.isArray(question.answers) ? question.answers.length : 
                         Array.isArray(question.answer) ? question.answer.length : 
                         question.answer ? 1 : 0) !== 1 ? 's' : ''
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilteredQuestions;