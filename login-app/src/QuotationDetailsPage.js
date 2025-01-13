import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function QuotationDetailsPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/quotations/${id}/items`)
      .then((response) => response.json())
      .then((data) => setQuotation(data))
      .catch((error) => console.error('Error fetching quotation details:', error));
  }, [id]);

  const sendQuotationRequest = () => {
    alert('Quotation request sent to suppliers!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h3>Quotation Details</h3>
      {quotation ? (
        <div>
          <ul>
            {quotation.map((item, index) => (
              <li key={index}>
                {item.item_name} (Quantity: {item.quantity}) - Supplier: {item.supplier_name || 'No known supplier'}
              </li>
            ))}
          </ul>
          <button onClick={sendQuotationRequest} style={{ marginBottom: '10px' }}>
            Send Quotation Request
          </button>
          <button onClick={() => navigate('/quotations')}>Back to Orders</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default QuotationDetailsPage;
