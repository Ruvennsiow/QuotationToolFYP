// MainQuotationPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MainQuotationPage() {
  const [quotations, setQuotations] = useState([]);
  const navigate = useNavigate();

  // Fetch quotations data
  useEffect(() => {
    fetch('http://localhost:5000/quotations')
      .then((response) => response.json())
      .then((data) => setQuotations(data))
      .catch((error) => console.error('Error fetching quotations:', error));
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>Quotations</h2>
      <nav style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/inventory')} style={{ marginRight: '10px' }}>
          Inventory
        </button>
        <button onClick={() => navigate('/quotations')}>Quotation</button>
      </nav>
      <button onClick={() => navigate('/new-quotation')} style={{ marginBottom: '20px' }}>
        New Quotation
      </button>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {quotations.map((quotation) => (
          <li
            key={quotation.id}
            onClick={() => navigate(`/quotation/${quotation.id}`)}
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              marginBottom: '10px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>
              <strong>{quotation.company_name}</strong> ({quotation.order_date})
            </span>
            <span>{quotation.items?.every((item) => item.supplier_name) ? '✔' : '✖'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MainQuotationPage;