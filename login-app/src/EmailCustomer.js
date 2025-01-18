import React, { useState, useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import './EmailCustomer.css';

function EmailCustomer({ quotation, onClose, onEmailSent }) {
  const [isLoading, setIsLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const BASE_URL = require('./config');

  // Calculate prices with 30% markup
  const calculateMarkup = (price) => {
    return (price * 1.3).toFixed(2);
  };

  // Extract email from company name if it contains a valid email
  useEffect(() => {
    if (quotation && quotation.company_name) {
      const emailRegex = /[a-zA-Z0-9._%+-]+@gmail\.com/;
      const match = quotation.company_name.match(emailRegex);
      if (match) {
        setCustomerEmail(match[0]);
      }
    }
  }, [quotation]);

  // Generate email body only if quotation and items exist
  const generateEmailBody = () => {
    if (!quotation || !quotation.items) return '';

    const itemsList = quotation.items
      .map(
        (item) => `- ${item.item_name}
   Quantity: ${item.quantity}
   Price per unit: $${calculateMarkup(item.price)}
   Total: $${(calculateMarkup(item.price) * item.quantity).toFixed(2)}`
      )
      .join('\n\n');

    const totalAmount = quotation.items
      .reduce((total, item) => total + (calculateMarkup(item.price) * item.quantity), 0)
      .toFixed(2);

    return `Dear ${quotation.company_name},

Please find below our quotation for your requested items:

${itemsList}

Total Quotation Amount: $${totalAmount}

Please let us know if you have any questions.

Best regards,
[Your Company Name]`;
  };

  const handleSendEmail = async () => {
    // Validate email
    if (!customerEmail.match(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)) {
      alert('Please enter a valid Gmail address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerEmail,
          subject: `Quotation for ${quotation.company_name}`,
          body: generateEmailBody(),
        }),
      });

      if (response.ok) {
        onEmailSent();
      } else {
        alert('Failed to send email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!quotation) {
    return null;
  }

  return (
    <div className="email-customer-overlay">
      {isLoading && <LoadingSpinner />}
      <div className="email-customer-modal">
        <h3 className="email-title">Send Quotation to Customer</h3>
        
        <div className="email-field">
          <span className="field-label">To:</span>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Enter customer email (Gmail only)"
            className="email-input"
            required
          />
        </div>
        
        <div className="email-field">
          <span className="field-label">Subject:</span>
          <span className="field-value">Quotation for {quotation.company_name}</span>
        </div>
        
        <div className="email-field">
          <span className="field-label">Body:</span>
          <pre className="email-body">{generateEmailBody()}</pre>
        </div>
        
        <div className="button-group">
          <button 
            onClick={handleSendEmail} 
            className="send-button"
            disabled={!customerEmail}
          >
            Send Email
          </button>
          <button onClick={onClose} className="close-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailCustomer;