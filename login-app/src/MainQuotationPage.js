import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainQuotationPage.css';
import LoadingSpinner from './components/LoadingSpinner';
import EmailCustomer from './EmailCustomer';

function MainQuotationPage() {
  const [quotations, setQuotations] = useState([]);
  const navigate = useNavigate();
  const BASE_URL = require('./config');
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomerEmail, setShowCustomerEmail] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // Fetch quotations data
  useEffect(() => {
    setIsLoading(true);
    fetch(`${BASE_URL}/quotations`)
      .then((response) => response.json())
      .then(async (data) => {
        // Fetch items for each quotation and enrich the quotation with its items
        const enrichedQuotations = await Promise.all(
          data.map(async (quotation) => {
            const itemsResponse = await fetch(
              `${BASE_URL}/quotations/${quotation.id}/items`
            );
            const items = await itemsResponse.json();
            return { ...quotation, items };
          })
        );
        setQuotations(enrichedQuotations);
      })
      .catch((error) => console.error('Error fetching quotations:', error))
      .finally(() => setIsLoading(false));
  }, []);

  const sendQuotationToCustomer = (quotation) => {
    setSelectedQuotation(quotation);
    setShowCustomerEmail(true);
  };

  return (
    <div className="quotation-container">
      {isLoading && <LoadingSpinner />}
      <div className="quotation-content">
        <h2 className="page-title">Quotations</h2>
        
        <nav className="navigation-bar">
          <button onClick={() => navigate('/inventory')} className="nav-button">
            Inventory
          </button>
          <button onClick={() => navigate('/quotations')} className="nav-button active">
            Quotation
          </button>
        </nav>

        <button onClick={() => navigate('/new-quotation')} className="new-quotation-button">
          New Quotation
        </button>

        <ul className="quotation-list">
          {quotations.map((quotation) => (
            <li key={quotation.id} className="quotation-item">
              <div 
                onClick={() => navigate(`/quotation/${quotation.id}`)} 
                className="quotation-details"
              >
                <div className="company-info">
                  <span className="company-name">{quotation.company_name}</span>
                  <span className="order-date">({quotation.order_date})</span>
                </div>
                <span className={`status-indicator ${
                  quotation.items?.every((item) => item.price && item.price > 0) 
                    ? 'complete' 
                    : 'incomplete'
                }`}>
                  {quotation.items?.every((item) => item.price && item.price > 0) ? '✔' : '✖'}
                </span>
              </div>
              
              {quotation.items?.every((item) => item.price && item.price > 0) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation when clicking the button
                    sendQuotationToCustomer(quotation);
                  }}
                  className="send-button"
                >
                  Send to Customer
                </button>
              )}
            </li>
          ))}
        </ul>
        {showCustomerEmail && selectedQuotation && (
        <EmailCustomer
          quotation={selectedQuotation}
          onClose={() => setShowCustomerEmail(false)}
          onEmailSent={() => {
            setShowCustomerEmail(false);
            // Optionally update the quotation status or refresh the list
          }}
        />
      )}
      </div>
    </div>
  );
}

export default MainQuotationPage;
