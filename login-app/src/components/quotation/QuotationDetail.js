import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QuotationDetail.css';
import PriceHistory from './PriceHistory';
import PricePrediction from './PredictPrice';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showPredictPrice, setShowPredictPrice] = useState(false);
  
  useEffect(() => {
    fetchQuotationDetails();
  }, [id]);
  
  const fetchQuotationDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/quotations/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setQuotation(data.quotation);
        setItems(data.items);
      } else {
        throw new Error(data.message || 'Failed to fetch quotation details');
      }
    } catch (error) {
      console.error('Error fetching quotation details:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateStatus = async (status) => {
    try {
      const response = await fetch(`${BASE_URL}/api/quotations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setQuotation({ ...quotation, status });
      } else {
        throw new Error(data.message || 'Failed to update quotation status');
      }
    } catch (error) {
      console.error('Error updating quotation status:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  const handleSendEmail = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/quotations/${id}/send-email`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert('Quotation email sent successfully!');
      } else {
        throw new Error(data.message || 'Failed to send quotation email');
      }
    } catch (error) {
      console.error('Error sending quotation email:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  const handleViewPriceHistory = (item) => {
    setSelectedItem(item);
    setShowPriceHistory(true);
  };
  
  const handlePredictPrice = (item) => {
    setSelectedItem(item);
    setShowPredictPrice(true);
  };
  
  const closePriceHistory = () => {
    setShowPriceHistory(false);
    setSelectedItem(null);
  };
  
  const closePredictPrice = () => {
    setShowPredictPrice(false);
    setSelectedItem(null);
  };
  
  if (loading) {
    return <div className="loading">Loading quotation details...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!quotation) {
    return <div className="not-found">Quotation not found</div>;
  }
  
  return (
    <div className="quotation-detail">
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate('/quotations')}>
          &larr; Back to Quotations
        </button>
        <div className="header-badges">
          <span className={`status-badge status-${quotation.status}`}>
            {quotation.status}
          </span>
          {quotation.auto_generated && (
            <span className="auto-badge">Auto-Generated</span>
          )}
        </div>
      </div>
      
      <h2>Quotation #{quotation.id}</h2>
      
      <div className="quotation-info">
        <div className="info-item">
          <span className="info-label">Company:</span>
          <span className="info-value">{quotation.company_name}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Date:</span>
          <span className="info-value">
            {new Date(quotation.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Status:</span>
          <span className="info-value">{quotation.status}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Source:</span>
          <span className="info-value">{quotation.source || 'Manual'}</span>
        </div>
        {quotation.auto_generated && (
          <>
            <div className="info-item">
              <span className="info-label">Confidence Score:</span>
              <span className="info-value">{quotation.confidence_score}%</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email Subject:</span>
              <span className="info-value">{quotation.email_subject || 'N/A'}</span>
            </div>
          </>
        )}
      </div>
      
      <div className="items-section">
        <h3>Items</h3>
        <table className="items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index}>
                <td>{index + 1}</td>
                <td>{item.item_name}</td>
                <td>{item.quantity}</td>
                <td>${parseFloat(item.price).toFixed(2)}</td>
                <td>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                <td>
                  <button 
                    className="price-history-button"
                    onClick={() => handleViewPriceHistory(item)}
                  >
                    Price History
                  </button>
                  <button 
                    className="predict-price-button"
                    onClick={() => handlePredictPrice(item)}
                  >
                    Predict Price
                  </button>
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="4" style={{ textAlign: 'right' }}>Total:</td>
              <td colSpan="2">
                ${items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="actions-section">
        {quotation.status === 'pending' && (
          <>
            <button 
              className="complete-button" 
              onClick={() => handleUpdateStatus('completed')}
            >
              Mark as Completed
            </button>
            <button 
              className="cancel-button" 
              onClick={() => handleUpdateStatus('cancelled')}
            >
              Cancel Quotation
            </button>
          </>
        )}
        
        <button 
          className="send-email-button" 
          onClick={handleSendEmail}
        >
          Send Quotation Email
        </button>
        
        <button 
          className="edit-button" 
          onClick={() => navigate(`/quotations/${id}/edit`)}
        >
          Edit Quotation
        </button>
      </div>
      
        {/* Price History Modal */}
        {showPriceHistory && selectedItem && (
        <div className="modal">
            <div className="modal-content">
            <span className="close" onClick={closePriceHistory}>&times;</span>
            <PriceHistory 
                itemName={selectedItem.item_name} 
                onClose={closePriceHistory} 
            />
            </div>
        </div>
        )}
      
        {/* Predict Price Modal */}
        {showPredictPrice && selectedItem && (
        <div className="modal">
            <div className="modal-content">
            <span className="close" onClick={closePredictPrice}>&times;</span>
            <PricePrediction 
                itemName={selectedItem.item_name}
                currentPrice={parseFloat(selectedItem.price)}
                onClose={closePredictPrice} 
            />
            </div>
        </div>
        )}
    </div>
  );
}

export default QuotationDetail;