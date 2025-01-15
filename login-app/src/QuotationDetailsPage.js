import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmailTemplate from './EmailTemplate';

function QuotationDetailsPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [emailedSuppliers, setEmailedSuppliers] = useState([]); // Track emailed suppliers
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://quotationtoolfyp.onrender.com/quotations/${id}/items`)
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
    fetch(`https://quotationtoolfyp.onrender.com/quotations/${id}/items`, {
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
  const updateItemStatusToPending = (supplier) => {
    const itemsToUpdate = editedItems.filter(
      (item) => item.supplier_name === supplier && item.status === 'not sent'
    );
  
    itemsToUpdate.forEach((item) => {
      fetch(`https://quotationtoolfyp.onrender.com/quotation-items/${item.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to update item status.');
          }
          // Update status locally to reflect the change in UI
          setEditedItems((prevItems) =>
            prevItems.map((itm) =>
              itm.id === item.id ? { ...itm, status: 'pending' } : itm
            )
          );
          console.log(`Status for item ${item.id} updated to pending.`);
        })
        .catch((error) => console.error('Error updating item status:', error));
    });
  };
  
  
  const handleSendQuotationRequest = (supplier) => {
    setSelectedSupplier(supplier);
    setShowEmailTemplate(true);
  };

  const handleEmailSent = (supplier) => {
    setEmailedSuppliers((prev) => [...prev, supplier]);
    setShowEmailTemplate(false);
    updateItemStatusToPending(supplier);
    alert(`Email sent to ${supplier}`);
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
                {item.supplier_name && item.supplier_name !== 'No known supplier' && (
                <>
                    {item.status === 'not sent' && (
                    <button
                        onClick={() =>
                        handleSendQuotationRequest(
                            item.supplier_name,
                            editedItems.filter((itm) => itm.supplier_name === item.supplier_name)
                        )
                        }
                        style={{ marginLeft: '10px', padding: '5px' }}
                    >
                        Send Quotation Request
                    </button>
                    )}
                    {item.status === 'pending' && (
                    <span style={{ color: 'green', marginLeft: '10px' }}>
                        ✔ Pending Quotation from Supplier
                    </span>
                    )}
                    {item.status === 'received' && (
                    <span style={{ color: 'blue', marginLeft: '10px' }}>
                        Received Quotation
                    </span>
                    )}
                </>
                )}
              </li>
            ))}
          </ul>
          <button onClick={saveQuotationPrices} style={{ marginBottom: '10px', marginRight: '10px' }}>
            Save Prices
          </button>
          <button onClick={() => navigate('/quotations')}>Back to Orders</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {showEmailTemplate && selectedSupplier && (
        <EmailTemplate
          supplier={selectedSupplier}
          items={editedItems.filter((item) => item.supplier_name === selectedSupplier)} // Only show items for the selected supplier
          onClose={() => setShowEmailTemplate(false)}
          onEmailSent={() => handleEmailSent(selectedSupplier)} // Callback when email is sent
        />
      )}
    </div>
  );
}

export default QuotationDetailsPage;
