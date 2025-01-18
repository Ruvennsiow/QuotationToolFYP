import React, { useState, useEffect } from 'react';
import './EditInventory.css';
import LoadingSpinner from './components/LoadingSpinner';

function EditInventory({ onClose, onInventoryUpdate }) {
    const [inventory, setInventory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [editedValues, setEditedValues] = useState({
      name: '',
      description: '',
      cost_price: '',
      selling_price: '',
      supplier_details: ''
    });
  const BASE_URL = require('./config');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/inventory`);
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setEditedValues({
      name: item.name, // Changed from name to item_name
      description: item.description,
      cost_price: item.cost_price,
      selling_price: item.selling_price,
      supplier_details: item.supplier_details || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/inventory/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedValues.name,
          description: editedValues.description,
          cost_price: parseFloat(editedValues.cost_price),
          selling_price: parseFloat(editedValues.selling_price),
          supplier_details: editedValues.supplier_details
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        onInventoryUpdate();
      } else {
        alert(data.error || 'Failed to update inventory item');
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Network error: Could not connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="edit-inventory-overlay">
      {isLoading && <LoadingSpinner />}
        <div className="edit-inventory-overlay">
        <div className="edit-inventory-modal">
            <h3 className="modal-title">Edit Inventory</h3>
            
            <div className="search-section">
            <input
                type="text"
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
            </div>

            <div className="inventory-selection">
            <select
                size="5"
                className="inventory-list"
                onChange={(e) => {
                const item = inventory.find(i => i.id === parseInt(e.target.value));
                handleItemSelect(item);
                }}
                value={selectedItem?.id || ''}
            >
                {filteredInventory.map(item => (
                <option key={item.id} value={item.id}>
                    {item.name}
                </option>
                ))}
            </select>
            </div>

            {selectedItem && (
            <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-group">
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={editedValues.name}
                    onChange={handleInputChange}
                    required
                />
                </div>

                <div className="form-group">
                <label>Description:</label>
                <textarea
                    name="description"
                    value={editedValues.description}
                    onChange={handleInputChange}
                    required
                />
                </div>

                <div className="form-group">
                <label>Cost Price:</label>
                <input
                    type="number"
                    name="cost_price"
                    value={editedValues.cost_price}
                    onChange={handleInputChange}
                    required
                />
                </div>

                <div className="form-group">
                <label>Selling Price:</label>
                <input
                    type="number"
                    name="selling_price"
                    value={editedValues.selling_price}
                    onChange={handleInputChange}
                    required
                />
                </div>

                <div className="form-group">
                <label>Supplier Details:</label>
                <input
                    type="text"
                    name="supplier_details"
                    value={editedValues.supplier_details}
                    onChange={handleInputChange}
                    required
                />
                </div>

                <div className="button-group">
                <button type="submit" className="save-button">
                    Save Changes
                </button>
                <button type="button" onClick={onClose} className="cancel-button">
                    Cancel
                </button>
                </div>
            </form>
            )}
        </div>
        </div>
    </div>
  );
}

export default EditInventory;