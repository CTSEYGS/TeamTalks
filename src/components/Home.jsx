import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import TopQuestions from './TopQuestions';
import TopContributors from './TopContributors';
import LatestQuestions from './LatestQuestions';

const Home = () => {
  const [search, setSearch] = useState('');
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]); // For search results
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (questions.length === 0) {
      setLoading(true);
      fetch('/api/knowledgedata')
        .then(res => res.json())
        .then(data => {
          setQuestions(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [questions]);

  // Search effect
  useEffect(() => {
    if (!search) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/semantic-search?query=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(data => {
        setFilteredQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  return (
    <div className="home-container">
      <div className="center-content">
        <div className="logo">Team.Talks</div>
        <form className="search-form" onSubmit={e => e.preventDefault()}>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search for questions, topics, or technologies..."
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
          <TopContributors questions={questions} />
        )}

        {loading && <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading awesome questions...</p>
        </div>}
        {search && !loading && (
          <ul className="search-results">
            {filteredQuestions.length === 0 && <li>--No results found.</li>}
            {filteredQuestions?.map(q => (
              <li
                key={q.id}
                className="search-result"
                onClick={() => navigate(`/question/${q.id}`, { state: q })}
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                {q.title}
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