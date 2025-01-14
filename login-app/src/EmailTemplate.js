import React from 'react';

function EmailTemplate({ supplier, items, onClose, onEmailSent }) {
  const emailBody = `Hi ${supplier},\n\nPlease provide us with a quotation for the following items:\n\n${items
    .map((item) => `- ${item.item_name} (Quantity: ${item.quantity})`)
    .join('\n')}\n\nBest regards,\nRuvenn`;

  const handleSendEmail = () => {
    fetch('https://quotationtoolfyp.onrender.com/send-email', {
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
    <div style={{ padding: '20px', border: '1px solid #ccc', background: '#f9f9f9', margin: '20px auto', maxWidth: '600px' }}>
      <h3>Email Template</h3>
      <p><strong>To:</strong> {supplier}</p>
      <p><strong>Subject:</strong> Quotation Request</p>
      <p><strong>Body:</strong></p>
      <pre style={{ background: '#eee', padding: '10px' }}>{emailBody}</pre>
      <button onClick={handleSendEmail} style={{ marginRight: '10px' }}>Send Email</button>
      <button onClick={onClose} style={{ marginTop: '10px' }}>Close</button>
    </div>
  );
}

export default EmailTemplate;
