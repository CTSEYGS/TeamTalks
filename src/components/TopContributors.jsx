import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import './TopContributors.css';

const TopContributors = ({ questions, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contributors, setContributors] = useState([]);
  const navigate = useNavigate(); // Add this hook

  useEffect(() => {
    if (questions.length > 0) {
      calculateContributors();
    }
  }, [questions]);

  const calculateContributors = () => {
    const contributorMap = {};

    questions.forEach(question => {
      const author = question.author || 'Anonymous';
      
      if (!contributorMap[author]) {
        contributorMap[author] = {
          name: author,
          questionCount: 0,
          answerCount: 0,
          totalUpvotes: 0
        };
      }

      contributorMap[author].questionCount++;
      contributorMap[author].totalUpvotes += question.upvotes || 0;

      // Count answers by this contributor
      if (Array.isArray(question.answers)) {
        question.answers.forEach(answer => {
          if (answer.user === author) {
            contributorMap[author].answerCount++;
            contributorMap[author].totalUpvotes += answer.upvotes || 0;
          }
        });
      }
    });

    const sortedContributors = Object.values(contributorMap)
      .sort((a, b) => {
        const scoreA = (a.questionCount * 2) + a.answerCount + a.totalUpvotes;
        const scoreB = (b.questionCount * 2) + b.answerCount + b.totalUpvotes;
        return scoreB - scoreA;
      })
      .slice(0, 5);

    setContributors(sortedContributors);
    onRefresh && onRefresh(sortedContributors);
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Add this function to handle author clicks
  const handleAuthorClick = (authorName) => {
    navigate(`/filtered/author/${encodeURIComponent(authorName)}`);
  };

  return (
    <div className={`top-contributors ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="contributors-toggle" onClick={handleToggle}>
        {isExpanded ? (
          <span className="close-icon">✕</span>
        ) : (
          <div className="trophy-icon">
            <div className="trophy">🏆</div>
            <div className="glow-effect"></div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="contributors-content">
          <h3 className="contributors-title">Top Contributors</h3>
          <div className="contributors-list">
            {contributors.length === 0 ? (
              <div className="no-contributors">
                <p>No contributors yet</p>
              </div>
            ) : (
              contributors.map((contributor, index) => (
                <div 
                  key={contributor.name} 
                  className="contributor-item"
                  onClick={() => handleAuthorClick(contributor.name)} // Add click handler
                  style={{ cursor: 'pointer' }} // Add cursor pointer
                  title={`View all questions by ${contributor.name}`} // Add tooltip
                >
                  <div className="contributor-rank">#{index + 1}</div>
                  <div className="contributor-info">
                    <div className="contributor-name">{contributor.name}</div>
                    <div className="contributor-stats">
                      <span className="stat">
                        📝 {contributor.questionCount} Q
                      </span>
                      <span className="stat">
                        💬 {contributor.answerCount} A
                      </span>
                      <span className="stat">
                        👍 {contributor.totalUpvotes}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopContributors;
