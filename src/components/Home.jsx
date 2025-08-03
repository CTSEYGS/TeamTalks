import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [search, setSearch] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

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
        setQuestions(data);
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
            placeholder="e.g. What is Canvas?"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
        {loading && <div>Loading...</div>}
        {search && !loading && (
          <ul className="search-results">
            {questions.length === 0 && <li>--No results found.</li>}
            {questions.map(q => (
              <li
                key={q.id}
                className="search-result"
                onClick={() => navigate(`/question/${q.id}`, { state: q })}
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                {q.title || q.answer}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="action-buttons-fixed">
        <button className="contribute-btn">I want to contribute answers</button>
        <button className="add-question-btn" onClick={() => navigate('/add-question')}>I have question to add</button>
      </div>
      <div className="footer-tm">
        &copy; 2025 TeamTalks
      </div>
    </div>
  );
};

export default Home;