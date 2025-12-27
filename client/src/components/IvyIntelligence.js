import React, { useState } from 'react';
import { aiAPI } from '../services/api';
import './IvyIntelligence.css';

const IvyIntelligence = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const result = await aiAPI.query(query);
      setResponse(result.data.response);
      setSuggestions(result.data.suggestions || []);
      setHistory([...history, { query, response: result.data.response }]);
      setQuery('');
    } catch (error) {
      setResponse('Sorry, I encountered an error. Please try again.');
      if (error.response?.status === 503) {
        setResponse('AI service is not configured. Please contact your administrator.');
      }
      console.error('AI Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    if (suggestion.type === 'navigate') {
      window.location.href = suggestion.path;
      onClose();
    } else if (suggestion.type === 'student') {
      window.location.href = `/crm?studentId=${suggestion.id}`;
      onClose();
    }
  };

  const exampleQueries = [
    "Find student Yağız",
    "Where should I put meeting notes?",
    "Show me all students with status Başarılı",
    "What tasks are pending?"
  ];

  return (
    <div className="ivy-intelligence">
      <div className="ai-header">
        <div className="ai-title">
          <span className="ai-icon">🧠</span>
          <h2>Ivy Intelligence</h2>
        </div>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <div className="ai-chat">
        {history.length === 0 && !response && (
          <div className="welcome-message">
            <p>Hi! I'm Ivy Intelligence. I can help you:</p>
            <ul>
              <li>Find students and leads</li>
              <li>Tell you where to put information</li>
              <li>Answer questions about your data</li>
              <li>Navigate the system</li>
            </ul>
            <div className="example-queries">
              <p>Try asking:</p>
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(example)}
                  className="example-btn"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="chat-history">
            {history.map((item, idx) => (
              <div key={idx} className="chat-item">
                <div className="user-query">
                  <strong>You:</strong> {item.query}
                </div>
                <div className="ai-response">
                  <strong>Ivy:</strong> {item.response}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {response && history.length === 0 && (
          <div className="current-response">
            <div className="ai-response">
              <strong>Ivy:</strong> {response}
            </div>
            {suggestions.length > 0 && (
              <div className="suggestions">
                <p>Quick actions:</p>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestion(suggestion)}
                    className="suggestion-btn"
                  >
                    {suggestion.type === 'navigate' 
                      ? `Go to ${suggestion.path.replace('/', '')}` 
                      : `View Student ${suggestion.id}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="ai-input-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me anything... (e.g., 'Find student Yağız', 'Where should I put meeting notes?')"
          disabled={loading}
          className="ai-input"
        />
        <button type="submit" disabled={loading || !query.trim()} className="ai-submit">
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>
    </div>
  );
};

export default IvyIntelligence;

