import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import UnansweredQuestionsSidebar from './UnansweredQuestionsSidebar';
import './Question.css';

function Answer({ answer }) {
    const [upvoteCount, setUpvoteCount] = useState(answer.upvotes || 0);
    const [hasUpvoted, setHasUpvoted] = useState(false);

    const handleUpvote = () => {
        if (!hasUpvoted) {
            setUpvoteCount(prev => prev + 1);
            setHasUpvoted(true);
        }
    };

    return (
        <div className="answer-box">
            <div dangerouslySetInnerHTML={{ __html: answer.text }} />
            {answer.user && (
                <div className="answer-meta">
                    <span className="answer-user">{answer.user}</span>
                    <span className="answer-date">{answer.date}</span>
                </div>
            )}
            <div className="answer-upvote">
                <button className="upvote-btn" onClick={handleUpvote}>
                    👍
                </button>
                <span className="upvote-count">{upvoteCount}</span>
            </div>
        </div>
    );
}

function Question() {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarExpanded, setSidebarExpanded] = useState(false); // Collapsed by default

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const fetchQuestion = async () => {
        try {
            const response = await fetch('/api/knowledgedata');
            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }
            const data = await response.json();
            const foundQuestion = data.find(q => q.id === parseInt(id));
            setQuestion(foundQuestion);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching questions:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleQuestionUpdate = () => {
        // Refresh the current question when sidebar updates a question
        fetchQuestion();
    };

    if (loading) return <div className="question-container"><div className="question-content">Loading...</div></div>;
    if (error) return <div className="question-container"><div className="question-content">Error: {error}</div></div>;
    if (!question) return <div className="question-container"><div className="question-content"><div className="not-found">Question not found</div></div></div>;

    return (
        <div className="question-page-layout">
            <div className="question-container">
                <div className="question-content">
                    <Link to="/" className="back-btn">← Back to Search</Link>
                    <h1 className="question-title">{question.title}</h1>
                    
                    <div className="answers-section">
                        {Array.isArray(question.answer) ? (
                            question.answer.map((ans, index) => (
                                <Answer key={index} answer={ans} />
                            ))
                        ) : (
                            <Answer answer={{ text: question.answer, user: null, date: null, upvotes: 0 }} />
                        )}
                    </div>
                </div>
            </div>

            <UnansweredQuestionsSidebar
                isExpanded={sidebarExpanded}
                onToggle={() => setSidebarExpanded(!sidebarExpanded)}
                onQuestionUpdate={handleQuestionUpdate}
            />
        </div>
    );
}

export default Question;
