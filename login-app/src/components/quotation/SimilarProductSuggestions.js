import React, { useState, useEffect } from 'react';
import './SimilarProductSuggestions.css';

const SimilarProductSuggestions = ({ itemName, onSelectSimilarProduct }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch suggestions if itemName is provided
    if (!itemName) return;
    
    console.log('SimilarProductSuggestions: Fetching for item:', itemName);
    
    const fetchSimilarProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch similar products
        console.log('Fetching similar products for:', itemName);
        const similarProductsUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/similar-products?itemName=${encodeURIComponent(itemName)}&limit=3`;
        
        const response = await fetch(similarProductsUrl);
        
        if (!response.ok) {
          throw new Error(`Similar products request failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Similar products response:', data);
        
        // Check if we have suggestions
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          console.log(`Found ${data.suggestions.length} similar products`);
          setSuggestions(data.suggestions);
        } else {
          console.log('No similar products found');
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Error in SimilarProductSuggestions:', err);
        setError(err.message || 'An error occurred');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSimilarProducts();
  }, [itemName]);
  
  const handleSelectProduct = (product) => {
    if (onSelectSimilarProduct) {
      onSelectSimilarProduct(product);
    }
  };
  
  // Don't render anything if no suggestions
  if (suggestions.length === 0 && !loading && !error) {
    return <p>No similar products found.</p>;
  }
  
  return (
    <div className="similar-products-container">
      <div className="similar-products-header">
        <h4>Did you mean one of these products?</h4>
      </div>
      
      {loading ? (
        <div className="loading">Looking for similar products...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="suggestions-list">
          {suggestions.map((product, index) => (
            <div key={index} className="suggestion-item">
              <div className="suggestion-details">
                <h5>{product.name || 'Unknown Product'}</h5>
                <p>Latest price: ${parseFloat(product.price || 0).toFixed(2)}</p>
                <p>Similarity: {Math.round((product.similarity || 0) * 100)}%</p>
              </div>
              <button 
                className="select-button"
                onClick={() => handleSelectProduct(product)}
              >
                Use This
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimilarProductSuggestions;