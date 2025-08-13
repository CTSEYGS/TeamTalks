import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import TopQuestions from './TopQuestions';
import TopContributors from './TopContributors';
import LatestQuestions from './LatestQuestions';
import { searchQuestions } from '../utils/searchUtils';

const Home = () => {
  const [search, setSearch] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
    fetch('/api/knowledgedata')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = searchQuestions(questions, search, 5);

  return (
    <div className="home-container">
      <div className="center-content">
        <div className="logo-section">
          <div className="logo">Team.Talks</div>
          <div className="logo-subtitle">.. turning collaboration into knowledge base</div>
        </div>
        <form className="search-form" onSubmit={e => e.preventDefault()}>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search for questions, topics, or contributors.."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
        
        {/* Top Questions Pills - shown when not searching */}
        {!search && !loading && (
          <>
            <TopQuestions questions={questions} />
            <LatestQuestions questions={questions} />
          </>
        )}
        
        {/* Top Contributors - fixed positioned */}
        {!loading && (
          <TopContributors 
            questions={questions} 
            onRefresh={(contributors) => {
              console.log('Contributors refreshed:', contributors);
            }}
          />
        )}
        
        {loading && <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading awesome questions...</p>
        </div>}
        {search && !loading && (
          <ul className="search-results">
            {filtered.length === 0 && <li  className="search-result">--No results found.</li>}
           {filtered.map(q => (
            <li
              key={q.id}
              className="search-result"
              onClick={() => navigate(`/question/${q.id}`, { state: q })}
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <div className="search-result-title">
                {q.title}
                <span className="search-meta">
                  <span className="author-pill">{q.author || 'Anonymous'}</span>
                  <span className="result-date">{q.createdDateDisplay || q.createdDate || 'Unknown'}</span>
                </span>
              </div>
            </li>
          ))}
          </ul>
        )}
      </div>
      <div className="action-buttons-fixed">
        
        <button className="add-question-btn" onClick={() => navigate('/add-question')}>I want to contribute..</button>
      </div>
      <div className="footer-tm">
        &copy; 2025 TeamTalks
      </div>
    </div>
  );
};

export default Home;