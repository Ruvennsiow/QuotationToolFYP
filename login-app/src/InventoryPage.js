import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();
  // Fetch inventory data from the server
  useEffect(() => {
    fetch('http://localhost:5000/inventory')
      .then((response) => response.json())
      .then((data) => setInventory(data))
      .catch((error) => console.error('Error fetching inventory:', error));
  }, []);

  // Filter inventory based on search
  const filteredInventory = inventory.filter(
    (item) =>
      item.Name.toLowerCase().includes(search.toLowerCase()) ||
      item.Description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>Inventory</h2>
      <nav style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/inventory')} style={{ marginRight: '10px' }}>
            Inventory
        </button>
        <button onClick={() => navigate('/quotation')}>Quotation</button>
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
          <h3>{selectedItem.Name}</h3>
          <img
            src={`http://localhost:5000/images/${selectedItem.Picture}`}
            alt={selectedItem.Name}
            style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
          />
          <p><strong>Description:</strong> {selectedItem.Description}</p>
          <p><strong>Cost Price:</strong> ${selectedItem['Cost Price']}</p>
          <p><strong>Selling Price:</strong> ${selectedItem['Selling Price']}</p>
          <p><strong>Supplier:</strong> {selectedItem['Supplier Details']}</p>
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
                key={item.Name}
                onClick={() => setSelectedItem(item)}
                style={{ cursor: 'pointer', border: '1px solid #ccc' }}
              >
                <td style={{ padding: '10px' }}>{item.Name}</td>
                <td style={{ padding: '10px' }}>{item.Description}</td>
                <td style={{ padding: '10px' }}>${item['Selling Price']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default InventoryPage;
