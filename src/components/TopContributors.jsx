import React, { useState, useEffect } from 'react';
import './TopContributors.css';

const TopContributors = ({ questions, onRefresh }) => {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default

  // Calculate contributors from props (fallback)
  const calculateContributorsFromProps = () => {
    const contributorCounts = {};
    
    questions.forEach(question => {
      if (Array.isArray(question.answer)) {
        question.answer.forEach(answer => {
          const user = answer.user || 'Anonymous';
          const upvotes = answer.upvotes || 0;
          
          if (!contributorCounts[user]) {
            contributorCounts[user] = {
              name: user,
              totalUpvotes: 0,
              answerCount: 0
            };
          }
          
          contributorCounts[user].totalUpvotes += upvotes;
          contributorCounts[user].answerCount += 1;
        });
      }
    });

    return Object.values(contributorCounts)
      .sort((a, b) => b.totalUpvotes - a.totalUpvotes)
      .slice(0, 5);
  };

  // Initial load from props
  useEffect(() => {
    if (questions && questions.length > 0) {
      const propsContributors = calculateContributorsFromProps();
      setContributors(propsContributors);
    }
  }, [questions]);

  // Fetch latest contributors from API
  const fetchLatestContributors = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/contributors/top');
      
      if (response.ok) {
        const latestContributors = await response.json();
        setContributors(latestContributors);
        setLastRefresh(new Date().toLocaleTimeString());
        
        if (onRefresh) {
          onRefresh(latestContributors);
        }
        
        console.log('Top contributors refreshed:', latestContributors);
      } else {
        const error = await response.json();
        console.error('Failed to fetch contributors:', error.error);
        alert('Failed to refresh contributors: ' + error.error);
      }
    } catch (error) {
      console.error('Error fetching contributors:', error);
      alert('Error refreshing contributors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    
    // Auto-refresh when expanding for the first time
    if (!isExpanded && !lastRefresh) {
      fetchLatestContributors();
    }
  };

  const handleRefreshClick = (e) => {
    e.stopPropagation(); // Prevent toggle when clicking refresh
    fetchLatestContributors();
  };

  return (
    <div className={`top-contributors ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Collapsed State - Trophy Icon Only */}
      {!isExpanded && (
        <div className="trophy-icon" onClick={handleToggleExpand} title="View Top Contributors">
          <div className="trophy">🏆</div>
          <div className="glow-effect"></div>
        </div>
      )}

      {/* Expanded State - Full Card */}
      {isExpanded && (
        <>
          <div className="contributors-header" onClick={handleToggleExpand}>
            <div className="header-content">
              <h3>🏆 Top Contributors</h3>
              <div className="header-icons">
                <button 
                  onClick={handleRefreshClick}
                  className={`refresh-btn ${loading ? 'loading' : ''}`}
                  disabled={loading}
                  title="Refresh contributors with latest upvotes"
                >
                  {loading ? '⏳' : '🔄'}
                </button>
                <button className="toggle-btn" title="Collapse">
                  ✕
                </button>
              </div>
            </div>
          </div>
          
          <div className="contributors-content">
            {lastRefresh && (
              <div className="last-refresh">
                Last updated: {lastRefresh}
              </div>
            )}
            
            <div className="contributors-list">
              {contributors.length === 0 ? (
                <div className="no-contributors">No contributors yet</div>
              ) : (
                contributors.map((contributor, index) => (
                  <div key={contributor.name} className="contributor-item">
                    <div className="contributor-rank">#{index + 1}</div>
                    <div className="contributor-info">
                      <div className="contributor-name">{contributor.name}</div>
                      <div className="contributor-stats">
                        <span className="upvotes">👍 {contributor.totalUpvotes}</span>
                        <span className="answers">💬 {contributor.answerCount}</span>
                        {contributor.questionsAnswered && (
                          <span className="questions">❓ {contributor.questionsAnswered}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TopContributors;
