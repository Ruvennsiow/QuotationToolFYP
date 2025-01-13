import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function QuotationDetailsPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/quotations/${id}/items`)
      .then((response) => response.json())
      .then((data) => {
        setQuotation(data);
        setEditedItems(data.map((item) => ({ ...item, price: item.price || '' })));
      })
      .catch((error) => console.error('Error fetching quotation details:', error));
  }, [id]);

  const handlePriceChange = (index, value) => {
    const updatedItems = [...editedItems];
    updatedItems[index].price = value;
    setEditedItems(updatedItems);
  };

  const saveQuotationPrices = () => {
    fetch(`http://localhost:5000/quotations/${id}/items`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedItems),
    })
      .then((response) => {
        if (response.ok) {
          alert('Prices saved successfully!');
          setQuotation(editedItems);
          navigate('/quotations');
        } else {
          alert('Failed to save prices.');
        }
      })
      .catch((error) => console.error('Error saving prices:', error));
  };

  const sendQuotationRequest = () => {
    alert('Quotation request sent to suppliers!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h3>Quotation Details</h3>
      {quotation ? (
        <div>
          <ul>
            {editedItems.map((item, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <span>
                  {item.item_name} (Quantity: {item.quantity}) - Supplier: {item.supplier_name || 'No known supplier'}
                </span>
                <br />
                <label>
                  Quotation Price:
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    style={{ marginLeft: '10px', padding: '5px' }}
                  />
                </label>
              </li>
            ))}
          </ul>
          <button onClick={saveQuotationPrices} style={{ marginBottom: '10px', marginRight: '10px' }}>
            Save Prices
          </button>
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