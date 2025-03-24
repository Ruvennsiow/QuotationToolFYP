import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewQuotationPage.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function NewQuotationPage() {
  const [companyName, setCompanyName] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [items, setItems] = useState([{ name: '', quantity: '' }]);
  const navigate = useNavigate();
  const BASE_URL = require('../../utils/config');
  const [isLoading, setIsLoading] = useState(false);

  const saveOrder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/quotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: companyName,
          order_date: orderDate,
          items: items
        }),
      });

      if (response.ok) {
        navigate('/quotations');
      } else {
        alert('Failed to save quotation');
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert('Error saving quotation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new-quotation-container">
      {isLoading && <LoadingSpinner />}
      <div className="new-quotation-content">
        <h2 className="page-title">New Quotation</h2>
        
        <div className="form-group">
          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="items-container">
          {items.map((item, index) => (
            <div key={index} className="item-row">
              <input
                type="text"
                placeholder="Item Name"
                value={item.name}
                onChange={(e) => {
                  const updatedItems = [...items];
                  updatedItems[index].name = e.target.value;
                  setItems(updatedItems);
                }}
                className="form-input item-input"
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
                className="form-input quantity-input"
              />
            </div>
          ))}
        </div>

        <button 
          onClick={() => setItems([...items, { name: '', quantity: '' }])}
          className="add-item-button"
        >
          + Add Item
        </button>

        <div className="button-group">
          <button onClick={saveOrder} className="save-button">
            Save Order
          </button>
          <button onClick={() => navigate('/')} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewQuotationPage;