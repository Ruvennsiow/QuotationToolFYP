import React, { useState, useEffect } from 'react';

function QuotationPage() {
  const [quotations, setQuotations] = useState([]); // Array for storing orders
  const [newOrder, setNewOrder] = useState(false); // Toggle for creating new order
  const [currentOrder, setCurrentOrder] = useState(null); // Current selected order
  const [companyName, setCompanyName] = useState(''); // New order company name
  const [orderDate, setOrderDate] = useState(''); // New order date
  const [items, setItems] = useState([{ name: '', quantity: '' }]); // Items in the new order

  // Fetch quotations data
  useEffect(() => {
    fetch('http://localhost:5000/quotations')
      .then((response) => response.json())
      .then((data) => {
        setQuotations(data);
      })
      .catch((error) => console.error('Error fetching quotations:', error));
  }, []);

  // Fetch items for a specific quotation
  const fetchQuotationItems = (quotationId) => {
    fetch(`http://localhost:5000/quotations/${quotationId}/items`)
      .then((response) => response.json())
      .then((data) => {
        setCurrentOrder({ ...quotations.find((q) => q.id === quotationId), items: data });
      })
      .catch((error) => console.error('Error fetching quotation items:', error));
  };

  // Save a new order
  const saveOrder = () => {
    const newQuotation = {
      companyName,
      orderDate,
      items,
    };

    fetch('http://localhost:5000/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuotation),
    })
      .then((response) => response.json())
      .then((createdQuotation) => {
        setQuotations([...quotations, createdQuotation]); // Add new order to the list
        setNewOrder(false); // Exit new order mode
        setCompanyName('');
        setOrderDate('');
        setItems([{ name: '', quantity: '' }]); // Reset new order form
        alert('Quotation successfully added!'); // Notify user
      })
      .catch((error) => console.error('Error saving order:', error));
  };

  // Handle sending the quotation request
  const sendQuotationRequest = () => {
    alert('Quotation request sent to suppliers!');
    // Here you can implement functionality to send emails or further actions
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>Quotations</h2>
      {!newOrder && !currentOrder ? (
        <div>
          <button onClick={() => setNewOrder(true)}>New Quotation</button>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {quotations.map((quotation) => (
              <li
                key={quotation.id}
                onClick={() => fetchQuotationItems(quotation.id)}
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
                  <strong>{quotation.companyName}</strong> ({quotation.orderDate})
                </span>
                <span>{quotation.items?.every((item) => item.supplier_name) ? '✔' : '✖'}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : newOrder ? (
        <div>
          <h3>New Quotation</h3>
          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
          />
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            style={{ marginBottom: '20px', padding: '5px', width: '100%' }}
          />
          {items.map((item, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Item Name"
                value={item.name}
                onChange={(e) => {
                  const updatedItems = [...items];
                  updatedItems[index].name = e.target.value;
                  setItems(updatedItems);
                }}
                style={{ marginRight: '10px', padding: '5px' }}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => {
                  const updatedItems = [...items];
                  updatedItems[index].quantity = e.target.value;
                  setItems(updatedItems);
                }}
                style={{ padding: '5px' }}
              />
            </div>
          ))}
          <button onClick={() => setItems([...items, { name: '', quantity: '' }])}>+</button>
          <br />
          <button onClick={saveOrder} style={{ marginTop: '20px' }}>
            Save Order
          </button>
          <button onClick={() => setNewOrder(false)} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <h3>Order Details</h3>
          <ul>
            {(currentOrder?.items || []).map((item, index) => (
              <li key={index}>
                {item.item_name} (Quantity: {item.quantity}) - Supplier: {item.supplier_name || 'No known supplier'}
              </li>
            ))}
          </ul>
          <button onClick={sendQuotationRequest} style={{ marginBottom: '10px' }}>
            Send Quotation Request
          </button>
          <button onClick={() => setCurrentOrder(null)}>Back to Orders</button>
        </div>
      )}
    </div>
  );
}

export default QuotationPage;
