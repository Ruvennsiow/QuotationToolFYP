import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditInventory from './EditInventory';
import AddInventory from './AddInventory';
import './InventoryPage.css';
import LoadingSpinner from './components/LoadingSpinner';

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = require('./config');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/inventory`);
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="inventory-container">
      {isLoading && <LoadingSpinner />}
      <div className="inventory-content">
        <h2 className="page-title">Inventory</h2>
        
        <nav className="navigation-bar">
          <button onClick={() => navigate('/inventory')} className="nav-button active">
            Inventory
          </button>
          <button onClick={() => navigate('/quotations')} className="nav-button">
            Quotation
          </button>
        </nav>

        <div className="action-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search Inventory"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <i className="search-icon">🔍</i>
          </div>
          
          <div className="button-container">
            <button 
              onClick={() => setShowEditModal(true)} 
              className="edit-button"
            >
              Edit Inventory
            </button>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="add-button"
            >
              Add Inventory
            </button>
          </div>
        </div>

        {selectedItem ? (
          <div className="item-details">
            <div className="item-content">
              <div className="item-text">
                <h3 className="item-title">{selectedItem.name}</h3>
                <div className="item-info">
                  <p><strong>Description:</strong> {selectedItem.description}</p>
                  <p><strong>Cost Price:</strong> ${selectedItem.cost_price}</p>
                  <p><strong>Selling Price:</strong> ${selectedItem.selling_price}</p>
                  <p><strong>Supplier:</strong> {selectedItem.supplier_details}</p>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="back-button"
                >
                  Back to List
                </button>
              </div>
              <img 
                src="https://placekitten.com/200/200"
                alt={selectedItem.name}
                className="item-image"
              />
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Selling Price</th>
                  <th>Supplier</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="table-row"
                  >
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>${item.selling_price}</td>
                    <td>{item.supplier_details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showEditModal && (
          <EditInventory
            onClose={() => setShowEditModal(false)}
            onInventoryUpdate={() => {
              fetchInventory();
              setShowEditModal(false);
            }}
          />
        )}
        {showAddModal && (
          <AddInventory
            onClose={() => setShowAddModal(false)}
            onInventoryUpdate={() => {
              fetchInventory();
              setShowAddModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default InventoryPage;