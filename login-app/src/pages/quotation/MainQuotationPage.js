import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MainQuotationPage.css';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function MainQuotationPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'manual', 'auto'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed', etc.
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/quotations`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setQuotations(data.quotations);
      } else {
        throw new Error(data.message || 'Failed to fetch quotations');
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuotation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) {
      return;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/quotations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted quotation from state
        setQuotations(quotations.filter(quotation => quotation.id !== id));
        alert('Quotation deleted successfully');
      } else {
        throw new Error(data.message || 'Failed to delete quotation');
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Filter quotations based on selection
  const filteredQuotations = quotations.filter(quotation => {
    // Filter by auto/manual
    if (filter === 'manual' && quotation.auto_generated) return false;
    if (filter === 'auto' && !quotation.auto_generated) return false;
    
    // Filter by status
    if (statusFilter !== 'all' && quotation.status !== statusFilter) return false;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        quotation.company_name.toLowerCase().includes(term) ||
        quotation.id.toString().includes(term) ||
        (quotation.email_subject && quotation.email_subject.toLowerCase().includes(term))
      );
    }
    
    return true;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="quotation-page">
      <div className="quotation-header">
        <h2>Quotations</h2>
        <Link to="/quotations/new" className="new-quotation-button">
          Create New Quotation
        </Link>
      </div>
      
      <div className="quotation-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-section">
          <div className="filter-group">
            <label>Type:</label>
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''} 
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={filter === 'manual' ? 'active' : ''} 
                onClick={() => setFilter('manual')}
              >
                Manual
              </button>
              <button 
                className={filter === 'auto' ? 'active' : ''} 
                onClick={() => setFilter('auto')}
              >
                Auto
              </button>
            </div>
          </div>
          
          <div className="filter-group">
            <label>Status:</label>
            <div className="filter-buttons">
              <button 
                className={statusFilter === 'all' ? 'active' : ''} 
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button 
                className={statusFilter === 'pending' ? 'active' : ''} 
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={statusFilter === 'completed' ? 'active' : ''} 
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading quotations...</div>
      ) : filteredQuotations.length === 0 ? (
        <div className="no-quotations">
          <p>No quotations found.</p>
        </div>
      ) : (
        <div className="quotations-table-container">
          <table className="quotations-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Date</th>
                <th>Type</th>
                {filter === 'auto' && <th>Confidence</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map(quotation => (
                <tr key={quotation.id} className={quotation.auto_generated ? 'auto-quotation-row' : ''}>
                  <td>{quotation.id}</td>
                  <td>
                    {quotation.company_name}
                    {quotation.email_subject && (
                      <div className="email-subject">{quotation.email_subject}</div>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(quotation.status)}`}>
                      {quotation.status}
                    </span>
                  </td>
                  <td>{new Date(quotation.created_at).toLocaleDateString()}</td>
                  <td>
                    {quotation.auto_generated ? (
                      <span className="auto-badge" title="Auto-generated quotation">
                        Auto
                      </span>
                    ) : (
                      <span className="manual-badge">
                        Manual
                      </span>
                    )}
                  </td>
                  {filter === 'auto' && (
                    <td>
                      {quotation.auto_generated ? (
                        <span className={`confidence-score ${getConfidenceColor(quotation.confidence_score)}`}>
                          {quotation.confidence_score}%
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  )}
                  <td className="actions-cell">
                    <Link to={`/quotations/${quotation.id}`} className="view-button">
                      View
                    </Link>
                    <button 
                      className="delete-button" 
                      onClick={() => handleDeleteQuotation(quotation.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Helper function for confidence color
function getConfidenceColor(score) {
  if (score >= 80) return 'high-confidence';
  if (score >= 60) return 'medium-confidence';
  return 'low-confidence';
}

export default MainQuotationPage;