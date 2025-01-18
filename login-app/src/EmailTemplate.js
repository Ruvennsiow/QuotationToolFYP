import React from 'react';
import './EmailTemplate.css';

function EmailTemplate({ supplier, items, onClose, onEmailSent }) {
  const emailBody = `Hi ${supplier},\n\nPlease provide us with a quotation for the following items:\n\n${items
    .map((item) => `- ${item.item_name} (Quantity: ${item.quantity})`)
    .join('\n')}\n\nBest regards,\nRuvenn`;
  const BASE_URL = require('./config');
  const handleSendEmail = () => {
    fetch(`${BASE_URL}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'ruvenn12@gmail.com',
        subject: 'Quotation Request',
        body: emailBody,
      }),
    })
      .then((response) => {
        if (response.ok) {
          onEmailSent(); // Trigger the callback on successful email
        } else {
          alert('Failed to send email.');
        }
      })
      .catch((error) => console.error('Error sending email:', error));
  };

  return (
    <div className="email-template-overlay">
      <div className="email-template-modal">
        <h3 className="email-title">Email Template</h3>
        
        <div className="email-field">
          <span className="field-label">To:</span>
          <span className="field-value">{supplier}</span>
        </div>
        
        <div className="email-field">
          <span className="field-label">Subject:</span>
          <span className="field-value">Quotation Request</span>
        </div>
        
        <div className="email-field">
          <span className="field-label">Body:</span>
          <pre className="email-body">{emailBody}</pre>
        </div>
        
        <div className="button-group">
          <button onClick={handleSendEmail} className="send-button">
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

export default EmailTemplate;
