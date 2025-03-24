import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Use a hardcoded URL for testing
const BASE_URL = 'http://localhost:5000';

function PriceHistory({ itemName, onClose }) {
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (itemName) {
      fetchPriceHistory();
    }
  }, [itemName]);

  const fetchPriceHistory = async () => {
    console.log(`Attempting to fetch price history for: ${itemName}`);
    try {
      setLoading(true);
      setError(null);
      
      // Log the exact URL being used
      const url = `${BASE_URL}/api/price-history/${encodeURIComponent(itemName)}`;
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url);
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`Error response: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        // Ensure all price values are numbers
        const processedData = data.data.map(item => ({
          ...item,
          price: Number(item.price)
        }));
        setPriceData(processedData);
      } else {
        throw new Error(data.message || 'Failed to fetch price history');
      }
    } catch (error) {
      console.error('Detailed error:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!priceData || priceData.length === 0) return null;
    
    const sortedData = [...priceData].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    return {
      labels: sortedData.map(item => {
        const date = new Date(item.created_at);
        return date.toLocaleDateString();
      }),
      datasets: [
        {
          label: `Price History for ${itemName}`,
          data: sortedData.map(item => item.price),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Price History for ${itemName}`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  // Safe calculation functions with error handling
  const safeCalculations = {
    getCurrentPrice: () => {
      try {
        return priceData[0]?.price.toFixed(2) || 'N/A';
      } catch (e) {
        console.error('Error calculating current price:', e);
        return 'N/A';
      }
    },
    
    getLowestPrice: () => {
      try {
        return Math.min(...priceData.map(item => item.price)).toFixed(2);
      } catch (e) {
        console.error('Error calculating lowest price:', e);
        return 'N/A';
      }
    },
    
    getHighestPrice: () => {
      try {
        return Math.max(...priceData.map(item => item.price)).toFixed(2);
      } catch (e) {
        console.error('Error calculating highest price:', e);
        return 'N/A';
      }
    },
    
    getAveragePrice: () => {
      try {
        return (priceData.reduce((sum, item) => sum + item.price, 0) / priceData.length).toFixed(2);
      } catch (e) {
        console.error('Error calculating average price:', e);
        return 'N/A';
      }
    }
  };

  return (
    <div className="price-history-modal">
      <div className="price-history-content">
        <div className="price-history-header">
          <h2>Price History for {itemName}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="price-history-body">
          {loading ? (
            <div className="loading">Loading price history...</div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchPriceHistory}>Try Again</button>
            </div>
          ) : priceData.length > 0 ? (
            <div className="chart-container">
              <Line data={getChartData()} options={chartOptions} />
              <div className="price-summary">
                <p><strong>Current Price:</strong> ${safeCalculations.getCurrentPrice()}</p>
                <p><strong>Lowest Price:</strong> ${safeCalculations.getLowestPrice()}</p>
                <p><strong>Highest Price:</strong> ${safeCalculations.getHighestPrice()}</p>
                <p><strong>Average Price:</strong> ${safeCalculations.getAveragePrice()}</p>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>No price history available for {itemName}.</p>
            </div>
          )}
        </div>
        
        <div className="price-history-footer">
          <button className="refresh-button" onClick={fetchPriceHistory} disabled={loading}>
            Refresh Data
          </button>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PriceHistory;