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
    fetch('/api/knowledgedata')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = questions
    .filter(q => q.title.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="home-container">
      <div className="center-content">
        <div className="logo">Team.Talks</div>
        <form className="search-form" onSubmit={e => e.preventDefault()}>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search TeamTalks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
        {loading && <div>Loading...</div>}
        {search && !loading && (
          <ul className="search-results">
            {filtered.length === 0 && <li>--No results found.</li>}
            {filtered.map(q => (
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
    </div>
  );
};

export default Home;