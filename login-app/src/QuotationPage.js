import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function QuotationPage() {
  const [quotations, setQuotations] = useState([]);
  const [newOrder, setNewOrder] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [items, setItems] = useState([{ name: '', quantity: '', price: '' }]);
  const [groupedSuppliers, setGroupedSuppliers] = useState({});
  const navigate = useNavigate();

  // Check if all items in an order are quoted
  const isOrderComplete = (order) =>
    Object.values(order.groupedSuppliers).every((items) =>
      items.every((item) => item.price && item.price > 0)
    );

  // Handle item input changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  // Add a new item row
  const addItemRow = () => {
    setItems([...items, { name: '', quantity: '', price: '' }]);
  };

  // Save a new order
  const saveOrder = () => {
    fetch('http://localhost:5000/inventory')
      .then((response) => response.json())
      .then((inventory) => {
        const suppliers = {};
        items.forEach((item) => {
          const inventoryItem = inventory.find(
            (invItem) => invItem.Name.toLowerCase() === item.name.toLowerCase()
          );
          const supplier = inventoryItem ? inventoryItem['Supplier Details'] : 'No known supplier';
          if (!suppliers[supplier]) suppliers[supplier] = [];
          suppliers[supplier].push({ ...item, supplier });
        });

        const newQuotation = {
          companyName,
          orderDate,
          groupedSuppliers: suppliers,
          isComplete: false,
        };

        setQuotations([...quotations, newQuotation]);
        setNewOrder(false); // Exit "New Order" mode
        setCompanyName('');
        setOrderDate('');
        setItems([{ name: '', quantity: '', price: '' }]);
      })
      .catch((error) => console.error('Error fetching inventory:', error));
  };

  // Manual price quotation
  const updateItemPrice = (supplier, itemIndex, price) => {
    const updatedOrder = { ...currentOrder };
    updatedOrder.groupedSuppliers[supplier][itemIndex].price = price;
    updatedOrder.isComplete = isOrderComplete(updatedOrder);
    setCurrentOrder(updatedOrder);
    setQuotations(
      quotations.map((order) =>
        order.companyName === updatedOrder.companyName ? updatedOrder : order
      )
    );
  };

  // Send Quotation to Customer
  const handleSendQuotation = (order) => {
    const emailTemplate = `Dear ${order.companyName},\n\nHere is the quotation for your order placed on ${order.orderDate}:\n\n` +
      Object.entries(order.groupedSuppliers)
        .map(
          ([supplier, items]) =>
            `From Supplier: ${supplier}\n` +
            items.map(
              (item) =>
                `- ${item.name} (Quantity: ${item.quantity}) - Price: $${item.price}`
            ).join('\n')
        )
        .join('\n\n') +
      `\n\nThank you.\n`;

    console.log('Email sent to:', order.companyName, '\nEmail Body:\n', emailTemplate);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>Quotations</h2>
      <nav style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/inventory')} style={{ marginRight: '10px' }}>
            Inventory
        </button>
        <button onClick={() => navigate('/quotation')}>Quotation</button>
      </nav>
      {!newOrder && !currentOrder ? (
        <div>
          <button onClick={() => setNewOrder(true)}>New Quotation</button>
          <ul>
            {quotations.map((quotation, index) => (
              <li
                key={index}
                onClick={() => setCurrentOrder(quotation)}
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  marginBottom: '10px',
                  cursor: 'pointer',
                }}
              >
                {quotation.companyName} ({quotation.orderDate}){' '}
                {isOrderComplete(quotation) ? '✔' : '✖'}
                {isOrderComplete(quotation) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent clicking the order
                      handleSendQuotation(quotation);
                    }}
                    style={{ marginLeft: '10px' }}
                  >
                    Send Quotation to Customer
                  </button>
                )}
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
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                style={{ marginRight: '10px', padding: '5px' }}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                style={{ padding: '5px' }}
              />
            </div>
          ))}
          <button onClick={addItemRow}>+</button>
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
          {Object.entries(currentOrder.groupedSuppliers).map(([supplier, items]) => (
            <div key={supplier} style={{ marginBottom: '20px' }}>
              <h4>Supplier: {supplier}</h4>
              <ul>
                {items.map((item, index) => (
                  <li key={index}>
                    {item.name} (Quantity: {item.quantity}) -{' '}
                    {item.price ? `Price: $${item.price}` : 'Price not quoted'}
                    <input
                      type="number"
                      placeholder="Manual Price"
                      value={item.price || ''}
                      onChange={(e) =>
                        updateItemPrice(supplier, index, parseFloat(e.target.value))
                      }
                      style={{ marginLeft: '10px', padding: '5px' }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button onClick={() => setCurrentOrder(null)}>Back to Orders</button>
        </div>
      )}
    </div>
  );
}

export default QuotationPage;
