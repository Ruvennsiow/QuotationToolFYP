import React, { useState, useEffect } from 'react';
import './PredictPrice.css';
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

const BASE_URL = 'http://localhost:5000';

function PredictPrice({ itemName, onClose }) {
  const [prediction, setPrediction] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysInFuture, setDaysInFuture] = useState(30);
  const [historyDays, setHistoryDays] = useState(365);

  useEffect(() => {
    if (itemName) {
      fetchPrediction();
      fetchPriceHistory();
    }
  }, [itemName]);

  const fetchPrediction = async () => {
    console.log(`Fetching price prediction for: ${itemName}`);
    try {
      setLoading(true);
      setError(null);
      
      const url = `${BASE_URL}/api/price-prediction/${encodeURIComponent(itemName)}?days=${daysInFuture}&history=${historyDays}`;
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url);
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Prediction data:', data);
      
      if (data.success) {
        setPrediction(data);
      } else {
        throw new Error(data.message || 'Failed to fetch price prediction');
      }
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const url = `${BASE_URL}/api/price-history/${encodeURIComponent(itemName)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Could not fetch price history: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Ensure all price values are numbers
        const processedData = data.data.map(item => ({
          ...item,
          price: Number(item.price)
        }));
        setPriceHistory(processedData);
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };

  const handleDaysChange = (e) => {
    setDaysInFuture(parseInt(e.target.value));
  };

  const handleHistoryChange = (e) => {
    setHistoryDays(parseInt(e.target.value));
  };

  const handleRefresh = () => {
    fetchPrediction();
    fetchPriceHistory();
  };

  const getChartData = () => {
  if (!priceHistory || !prediction) return null;
  
  // Sort data by date (oldest to newest)
  const sortedData = [...priceHistory].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
  // Create labels for all dates including future
  const labels = [];
  const data = [];
  const predictedData = [];
  
  // Add historical data points
  sortedData.forEach((item, index) => {
    const date = new Date(item.created_at);
    labels.push(date.toLocaleDateString());
    data.push(item.price);
    predictedData.push(null); // No prediction for historical data
  });
  
  // Add future data point
  if (sortedData.length > 0) {
    const lastDate = new Date(sortedData[sortedData.length - 1].created_at);
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + daysInFuture);
    labels.push(futureDate.toLocaleDateString());
    data.push(null); // No actual data for future
    predictedData.push(prediction.predictedPrice);
  } else if (prediction.singleDataPoint) {
    // For single data point predictions
    const predictionDate = new Date(prediction.predictionDate);
    labels.push(predictionDate.toLocaleDateString());
    data.push(null);
    predictedData.push(prediction.predictedPrice);
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'Historical Prices',
        data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      },
      {
        label: 'Predicted Price',
        data: predictedData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
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
        text: `Price Prediction for ${itemName}`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            if (value === null) return '';
            return `$${value.toFixed(2)}`;
          }
        }
      }
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

  const getConfidenceColor = (score) => {
    if (score >= 70) return 'green';
    if (score >= 40) return 'orange';
    return 'red';
  };

  return (
    <div className="predict-price-modal">
      <div className="predict-price-content">
        <div className="predict-price-header">
          <h2>Price Prediction for {itemName}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="predict-price-body">
          <div className="prediction-controls">
            <div className="control-group">
              <label htmlFor="days-future">Days in Future:</label>
              <input 
                type="range" 
                id="days-future" 
                min="1" 
                max="365" 
                value={daysInFuture} 
                onChange={handleDaysChange}
              />
              <span>{daysInFuture} days</span>
            </div>
            
            <div className="control-group">
              <label htmlFor="history-days">History to Use:</label>
              <input 
                type="range" 
                id="history-days" 
                min="30" 
                max="1095" 
                step="30" 
                value={historyDays} 
                onChange={handleHistoryChange}
              />
              <span>{historyDays} days</span>
            </div>
            
            <button className="apply-button" onClick={handleRefresh}>
              Apply Changes
            </button>
          </div>
          
          {loading ? (
            <div className="loading">Loading prediction...</div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={handleRefresh}>Try Again</button>
            </div>
          ) : prediction ? (
            <div className="prediction-results">
              <div className="chart-container">
                {getChartData() && <Line data={getChartData()} options={chartOptions} />}
              </div>
              
              <div className="prediction-summary">
                <div className="prediction-card current">
                  <h3>Current Price</h3>
                  <div className="price">${Number(prediction.currentPrice).toFixed(2)}</div>
                </div>
                
                <div className="prediction-card predicted">
                  <h3>Predicted Price</h3>
                  <div className="price">${Number(prediction.predictedPrice).toFixed(2)}</div>
                  <div className="prediction-date">
                    on {new Date(prediction.predictionDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="prediction-card confidence">
                  <h3>Confidence</h3>
                  <div 
                    className="confidence-score" 
                    style={{ color: getConfidenceColor(prediction.confidence.score) }}
                  >
                    {prediction.confidence.score}%
                  </div>
                  <div className="confidence-interval">
                    ±${prediction.confidence.interval.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="prediction-details">
                <h3>Prediction Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Price Trend:</span>
                    <span className="detail-value">{prediction.trend.charAt(0).toUpperCase() + prediction.trend.slice(1)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Data Points:</span>
                    <span className="detail-value">{prediction.confidence.dataPoints}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">R² Value:</span>
                    <span className="detail-value">{prediction.confidence.rSquared.toFixed(4)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Correlation:</span>
                    <span className="detail-value">{prediction.regression.correlation.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>No prediction available for {itemName}.</p>
            </div>
          )}
        </div>
        
        <div className="predict-price-footer">
          <button className="refresh-button" onClick={handleRefresh} disabled={loading}>
            Refresh Prediction
          </button>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PredictPrice;