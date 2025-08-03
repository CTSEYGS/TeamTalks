import React, { useState } from 'react';
import './TopContributors.css';

const TopContributors = ({ questions }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Extract contributors from all questions and answers
  const getTopContributors = () => {
    const contributors = new Map();
    
    questions.forEach(question => {
      if (question.answer && Array.isArray(question.answer)) {
        question.answer.forEach(ans => {
          if (ans.user && ans.user !== 'Anonymous') {
            const user = ans.user;
            if (contributors.has(user)) {
              contributors.set(user, {
                ...contributors.get(user),
                answers: contributors.get(user).answers + 1,
                totalUpvotes: contributors.get(user).totalUpvotes + (ans.upvotes || 0)
              });
            } else {
              contributors.set(user, {
                name: user,
                answers: 1,
                totalUpvotes: ans.upvotes || 0
              });
            }
          }
        });
      }
    });
    
    // Sort by total contributions (answers + upvotes)
    return Array.from(contributors.values())
      .sort((a, b) => (b.answers + b.totalUpvotes) - (a.answers + a.totalUpvotes))
      .slice(0, 5); // Top 5 contributors
  };

  const topContributors = getTopContributors();

  if (topContributors.length === 0) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="contributors-toggle-icon" onClick={() => setIsVisible(true)}>
        🏆
      </div>
    );
  }

  return (
    <div className="top-contributors-container" onClick={() => setIsVisible(false)}>
      <div className="contributors-header">
        <h3 className="contributors-title">🏆 Top Contributors</h3>
        <span className="close-hint">✕</span>
      </div>
      <div className="contributors-list">
        {topContributors.map((contributor, index) => (
          <div key={contributor.name} className="contributor-card">
            <div className="contributor-rank">#{index + 1}</div>
            <div className="contributor-info">
              <div className="contributor-name">{contributor.name}</div>
              <div className="contributor-stats">
                <span className="stat-badge answers">{contributor.answers} answers</span>
                {contributor.totalUpvotes > 0 && (
                  <span className="stat-badge upvotes">👍 {contributor.totalUpvotes}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopContributors;
