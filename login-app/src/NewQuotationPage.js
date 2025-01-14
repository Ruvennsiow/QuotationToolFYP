import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NewQuotationPage() {
  const [companyName, setCompanyName] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [items, setItems] = useState([{ name: '', quantity: '' }]);
  const navigate = useNavigate();

  const saveOrder = () => {
    const newQuotation = {
      companyName,
      orderDate,
      items,
    };

    fetch('https://quotationtoolfyp.onrender.com/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuotation),
    })
      .then((response) => response.json())
      .then(() => {
        alert('Quotation successfully added!');
        navigate('/quotations'); // Redirect back to the main page
      })
      .catch((error) => console.error('Error saving order:', error));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
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
      <button onClick={() => navigate('/')} style={{ marginLeft: '10px' }}>
        Cancel
      </button>
    </div>
  );
}

export default NewQuotationPage;