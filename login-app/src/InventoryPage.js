// InventoryPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  // Fetch inventory data
  useEffect(() => {
    fetch('http://localhost:5000/inventory')
      .then((response) => response.json())
      .then((data) => setInventory(data))
      .catch((error) => console.error('Error fetching inventory:', error));
  }, []);

  // Filter inventory based on search
  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>Inventory</h2>
      <nav style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/inventory')} style={{ marginRight: '10px' }}>
          Inventory
        </button>
        <button onClick={() => navigate('/quotations')}>Quotation</button>
      </nav>
      <input
        type="text"
        placeholder="Search Inventory"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      />

      {selectedItem ? (
        <div>
          <h3>{selectedItem.name}</h3>
          <p><strong>Description:</strong> {selectedItem.description}</p>
          <p><strong>Cost Price:</strong> ${selectedItem.cost_price}</p>
          <p><strong>Selling Price:</strong> ${selectedItem.selling_price}</p>
          <p><strong>Supplier:</strong> {selectedItem.supplier_details}</p>
          <button onClick={() => setSelectedItem(null)}>Back to List</button>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Name</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Description</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Selling Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{ cursor: 'pointer', border: '1px solid #ccc' }}
              >
                <td style={{ padding: '10px' }}>{item.name}</td>
                <td style={{ padding: '10px' }}>{item.description}</td>
                <td style={{ padding: '10px' }}>${item.selling_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default InventoryPage;