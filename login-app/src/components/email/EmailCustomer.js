import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import './EmailCustomer.css';

function EmailCustomer({ quotation, onClose, onEmailSent }) {
  const [isLoading, setIsLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [debugInfo, setDebugInfo] = useState({});
  
  // Import BASE_URL directly to see its actual value
  const BASE_URL = require('../../utils/config');
  console.log('BASE_URL value:', BASE_URL);

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

  // Test API connection on component mount
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        // Test the debug endpoint
        const testUrl = `${BASE_URL}/api/debug`;
        console.log('Testing API connection to:', testUrl);
        
        const response = await fetch(testUrl);
        const data = await response.json();
        console.log('API connection test result:', data);
        
        // Store debug info for display
        setDebugInfo({
          baseUrl: BASE_URL,
          testUrl: testUrl,
          testResult: data,
          quotationId: quotation?.id
        });
      } catch (error) {
        console.error('API connection test failed:', error);
        setDebugInfo({
          error: error.message,
          baseUrl: BASE_URL
        });
      }
    };
    
    if (quotation && quotation.id) {
      testApiConnection();
    }
  }, [BASE_URL, quotation]);

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
      // Step 1: Send the email
      console.log('Sending email to:', customerEmail);
      const emailUrl = `${BASE_URL}/send-email`;
      console.log('Email API URL:', emailUrl);
      
      const emailResponse = await fetch(emailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerEmail,
          subject: `Quotation for ${quotation.company_name}`,
          body: generateEmailBody(),
        }),
      });

      console.log('Email response status:', emailResponse.status);
      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Email sending failed:', errorText);
        throw new Error(`Failed to send email: ${errorText}`);
      }
      
      // Step 2: Update the quotation status to "completed" and save price history
      console.log('Updating quotation status for ID:', quotation.id);
      
      // Explicitly construct the URL with the correct path
      const updateUrl = `${BASE_URL}/api/quotations/${quotation.id}/send`;
      console.log('Update API URL:', updateUrl);
      
      // We don't need to send customerEmail anymore since we're not storing it
      const updateResponse = await fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Empty body is fine
      });
      
      console.log('Update response status:', updateResponse.status);
      
      // Get the response text first (whether it's JSON or not)
      const responseText = await updateResponse.text();
      console.log('Raw response:', responseText);
      
      if (!updateResponse.ok) {
        console.error('Quotation update failed:', responseText);
        throw new Error(`Failed to update quotation status: ${responseText}`);
      }
      
      // Try to parse the response as JSON
      let updateData;
      try {
        updateData = JSON.parse(responseText);
        console.log('Update response data:', updateData);
      } catch (jsonError) {
        console.error('Error parsing response:', jsonError);
        throw new Error(`Invalid response from server: ${responseText}`);
      }
      
      // Show success message
      alert('Quotation has been sent to the customer and marked as completed.');
      
      // Notify parent component that email was sent successfully
      onEmailSent();
      
    } catch (error) {
      console.error('Error in send email process:', error);
      alert(`Error: ${error.message}`);
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
        
        {/* Debug information section */}
        <div className="debug-info" style={{ fontSize: '10px', backgroundColor: '#f0f0f0', padding: '5px', marginBottom: '10px' }}>
          <h4>Debug Info:</h4>
          <p>BASE_URL: {BASE_URL}</p>
          <p>Quotation ID: {quotation.id}</p>
          <p>Update URL: {`${BASE_URL}/api/quotations/${quotation.id}/send`}</p>
          {Object.keys(debugInfo).length > 0 && (
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          )}
        </div>
        
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