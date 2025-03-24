import React, { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import './AddInventory.css';

function AddInventory({ onClose, onInventoryUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    cost_price: '',
    selling_price: '',
    supplier_details: ''
  });
  const BASE_URL = require('../../utils/config');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        // Validate prices are positive numbers
        if (parseFloat(newItem.cost_price) <= 0 || parseFloat(newItem.selling_price) <= 0) {
          alert('Prices must be positive numbers');
          return;
        }
    
        const response = await fetch(`${BASE_URL}/inventory`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newItem.name.trim(),
            description: newItem.description.trim(),
            cost_price: parseFloat(newItem.cost_price),
            selling_price: parseFloat(newItem.selling_price),
            supplier_details: newItem.supplier_details.trim()
          }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          onInventoryUpdate();
          onClose();
        } else {
          alert(data.error || 'Failed to add inventory item');
        }
      } catch (error) {
        console.error('Error adding inventory:', error);
        alert('Network error: Could not connect to the server');
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="add-inventory-overlay">
      {isLoading && <LoadingSpinner />}
      <div className="add-inventory-modal">
        <h2>Add New Inventory Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={newItem.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={newItem.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Cost Price:</label>
            <input
              type="number"
              step="0.01"
              name="cost_price"
              value={newItem.cost_price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Selling Price:</label>
            <input
              type="number"
              step="0.01"
              name="selling_price"
              value={newItem.selling_price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Supplier Details:</label>
            <input
              type="text"
              name="supplier_details"
              value={newItem.supplier_details}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="button-group">
            <button type="submit" className="save-button">
              Add Item
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddInventory;