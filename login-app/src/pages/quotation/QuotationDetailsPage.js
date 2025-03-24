import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmailTemplate from '../../components/email/EmailTemplate';
import './QuotationDetailsPage.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmailCustomer from '../../components/email/EmailCustomer';
import QuotationDetail from '../../components/quotation/QuotationDetail';

function QuotationDetailsPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [emailedSuppliers, setEmailedSuppliers] = useState([]); // Track emailed suppliers
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const navigate = useNavigate();
  const BASE_URL = require('../../utils/config');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${BASE_URL}/quotations/${id}/items`)
      .then((response) => response.json())
      .then((data) => {
        setQuotation(data);
        setEditedItems(data.map((item) => ({ ...item, price: item.price || '' })));
      })
      .catch((error) => console.error('Error fetching quotation details:', error))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handlePriceChange = (index, value) => {
    const updatedItems = [...editedItems];
    updatedItems[index].price = value;
    setEditedItems(updatedItems);
  };

  // Add this function to handle price updates from QuotationDetail
  const handleUpdatePrice = async (quotationId, itemName, price) => {
    try {
      // Update the local state
      setEditedItems(prevItems => 
        prevItems.map(item => 
          item.item_name === itemName 
            ? { ...item, price: price } 
            : item
        )
      );
      
      // No need to make an API call here as QuotationDetail already does that
      console.log(`Price updated for ${itemName}: $${price}`);
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const saveQuotationPrices = () => {
    setIsLoading(true);
    fetch(`${BASE_URL}/quotations/${id}/items`, {
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
      .catch((error) => console.error('Error saving prices:', error))
      .finally(() => setIsLoading(false));
  };
  
  const updateItemStatusToPending = (supplier) => {
    const itemsToUpdate = editedItems.filter(
      (item) => item.supplier_name === supplier && item.status === 'not sent'
    );
  
    itemsToUpdate.forEach((item) => {
      fetch(`${BASE_URL}/quotation-items/${item.id}/status`, {
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
    <div className="quotation-details-container">
      {isLoading && <LoadingSpinner />}
      <div className="quotation-details-content">
        <h3 className="page-title">Quotation Details</h3>
        
        {quotation ? (
          <div className="details-wrapper">
            {/* Add the QuotationDetail component here */}
            <QuotationDetail 
              quotation={{
                id: id,
                customer_name: quotation[0]?.customer_name || 'Customer',
                created_at: quotation[0]?.created_at || new Date().toISOString(),
                status: quotation[0]?.status || 'draft',
                items: editedItems
              }}
              onUpdatePrice={handleUpdatePrice}
            />
            
            {/* Keep your existing UI for backward compatibility */}
            <ul className="items-list">
              {editedItems.map((item, index) => (
                <li key={index} className="item-card">
                  <div className="item-info">
                    <span className="item-name">
                      {item.item_name} 
                      <span className="quantity-badge">
                        Quantity: {item.quantity}
                      </span>
                    </span>
                    <span className="supplier-info">
                      Supplier: {item.supplier_name || 'No known supplier'}
                    </span>
                  </div>
                  
                  <div className="price-section">
                    <label className="price-label">
                      Quotation Price:
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handlePriceChange(index, e.target.value)}
                        className="price-input"
                      />
                    </label>
                  </div>

                  {item.supplier_name && item.supplier_name !== 'No known supplier' && (
                    <div className="supplier-actions">
                      {item.status === 'not sent' && (
                        <button
                          onClick={() => handleSendQuotationRequest(
                            item.supplier_name,
                            editedItems.filter((itm) => itm.supplier_name === item.supplier_name)
                          )}
                          className="request-button"
                        >
                          Send Quotation Request
                        </button>
                      )}
                      {item.status === 'pending' && (
                        <span className="status-badge pending">
                          ✔ Pending Quotation from Supplier
                        </span>
                      )}
                      {item.status === 'received' && (
                        <span className="status-badge received">
                          Received Quotation
                        </span>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            
            <div className="action-buttons">
              <button onClick={saveQuotationPrices} className="save-button">
                Save Prices
              </button>
              <button onClick={() => navigate('/quotations')} className="back-button">
                Back to Orders
              </button>
            </div>
          </div>
        ) : (
          <p className="loading-text">Loading...</p>
        )}

        {showEmailTemplate && selectedSupplier && (
          <EmailTemplate
            supplier={selectedSupplier}
            items={editedItems.filter((item) => item.supplier_name === selectedSupplier)}
            onClose={() => setShowEmailTemplate(false)}
            onEmailSent={() => handleEmailSent(selectedSupplier)}
          />
        )}
      </div>
    </div>
  );
}

export default QuotationDetailsPage;