import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MainQuotationPage() {
  const [quotations, setQuotations] = useState([]);
  const navigate = useNavigate();

  // Fetch quotations data
  useEffect(() => {
    fetch('http://localhost:5000/quotations')
      .then((response) => response.json())
      .then(async (data) => {
        // Fetch items for each quotation and enrich the quotation with its items
        const enrichedQuotations = await Promise.all(
          data.map(async (quotation) => {
            const itemsResponse = await fetch(
              `http://localhost:5000/quotations/${quotation.id}/items`
            );
            const items = await itemsResponse.json();
            return { ...quotation, items };
          })
        );
        setQuotations(enrichedQuotations);
      })
      .catch((error) => console.error('Error fetching quotations:', error));
  }, []);

  const sendQuotationToCustomer = (quotationId) => {
    alert(`Quotation ${quotationId} has been sent to the customer!`);
    // Here you can implement the API call or email sending logic
  };

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
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              marginBottom: '10px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div onClick={() => navigate(`/quotation/${quotation.id}`)} style={{ flex: 1 }}>
              <span>
                <strong>{quotation.company_name}</strong> ({quotation.order_date})
              </span>
              <span style={{ marginLeft: '10px' }}>
                {quotation.items?.every((item) => item.price && item.price > 0) ? '✔' : '✖'}
              </span>
            </div>
            {quotation.items?.every((item) => item.price && item.price > 0) && (
              <button
                onClick={() => sendQuotationToCustomer(quotation.id)}
                style={{ marginLeft: '10px', padding: '5px 10px' }}
              >
                Send to Customer
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MainQuotationPage;
