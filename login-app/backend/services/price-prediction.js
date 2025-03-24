const { getPriceHistory } = require('./price-history');

/**
 * Perform linear regression on price history data
 * @param {Array} data - Array of price history objects with created_at and price properties
 * @returns {Object} - Regression coefficients and statistics
 */
function performLinearRegression(data) {
  if (!data || data.length < 2) {
    return {
      slope: 0,
      intercept: data && data.length > 0 ? data[0].price : 0,
      rSquared: 0,
      correlation: 0,
      error: 'Insufficient data for regression'
    };
  }

  // Sort data by date (oldest to newest)
  const sortedData = [...data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
  // Convert dates to numeric values (days since first record)
  const firstDate = new Date(sortedData[0].created_at);
  const xValues = sortedData.map(item => {
    const date = new Date(item.created_at);
    return (date - firstDate) / (1000 * 60 * 60 * 24); // Convert to days
  });
  
  const yValues = sortedData.map(item => Number(item.price));
  
  // Calculate means
  const n = xValues.length;
  const meanX = xValues.reduce((sum, x) => sum + x, 0) / n;
  const meanY = yValues.reduce((sum, y) => sum + y, 0) / n;
  
  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - meanX) * (yValues[i] - meanY);
    denominator += (xValues[i] - meanX) ** 2;
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;
  
  // Calculate R-squared
  const predictedValues = xValues.map(x => slope * x + intercept);
  const totalSumOfSquares = yValues.reduce((sum, y) => sum + (y - meanY) ** 2, 0);
  const residualSumOfSquares = yValues.reduce((sum, y, i) => sum + (y - predictedValues[i]) ** 2, 0);
  const rSquared = 1 - (residualSumOfSquares / totalSumOfSquares);
  
  // Calculate correlation coefficient
  const correlation = Math.sqrt(rSquared) * (slope >= 0 ? 1 : -1);
  
  return {
    slope,
    intercept,
    rSquared,
    correlation,
    firstDate,
    meanPrice: meanY,
    priceRange: {
      min: Math.min(...yValues),
      max: Math.max(...yValues)
    },
    dataPoints: n
  };
}

/**
 * Predict future price for an item
 * @param {string} itemName - The name of the item
 * @param {number} daysInFuture - Number of days in the future to predict
 * @param {number} historyDays - Number of days of history to use for prediction
 * @returns {Promise<Object>} - Prediction results
 */
async function predictPrice(itemName, daysInFuture = 30, historyDays = 365) {
  console.log(`Predicting price for ${itemName} ${daysInFuture} days in the future using ${historyDays} days of history`);
  
  try {
    if (!itemName) {
      throw new Error('Item name is required');
    }
    
    // Get price history
    const history = await getPriceHistory(itemName, 1000); // Get a large sample
    
    if (!history || history.length === 0) {
      return {
        success: false,
        message: `No price history found for ${itemName}`,
        itemNotFound: true
      };
    }
    
    // Handle case with only one data point
    if (history.length === 1) {
      console.log(`Only one price history record found for ${itemName}. Using flat prediction.`);
      const currentPrice = Number(history[0].price);
      const recordDate = new Date(history[0].created_at);
      const predictionDate = new Date(recordDate);
      predictionDate.setDate(predictionDate.getDate() + daysInFuture);
      
      return {
        success: true,
        item: itemName,
        currentPrice: currentPrice,
        predictedPrice: currentPrice, // Same as current price
        daysInFuture,
        predictionDate: predictionDate.toISOString(),
        confidence: {
          score: 50, // Medium confidence
          interval: currentPrice * 0.1, // 10% interval
          rSquared: 1, // Perfect fit (only one point)
          dataPoints: 1
        },
        trend: 'stable',
        regression: {
          slope: 0,
          intercept: currentPrice,
          correlation: 0
        },
        singleDataPoint: true // Flag to indicate this is based on a single data point
      };
    }
    
    // Filter history to the specified time range if needed
    let filteredHistory = history;
    if (historyDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - historyDays);
      filteredHistory = history.filter(item => new Date(item.created_at) >= cutoffDate);
    }
    
    // If filtering left us with only one point, handle it
    if (filteredHistory.length === 1) {
      console.log(`Only one price history record found in filtered range for ${itemName}. Using flat prediction.`);
      const currentPrice = Number(filteredHistory[0].price);
      const recordDate = new Date(filteredHistory[0].created_at);
      const predictionDate = new Date(recordDate);
      predictionDate.setDate(predictionDate.getDate() + daysInFuture);
      
      return {
        success: true,
        item: itemName,
        currentPrice: currentPrice,
        predictedPrice: currentPrice, // Same as current price
        daysInFuture,
        predictionDate: predictionDate.toISOString(),
        confidence: {
          score: 50, // Medium confidence
          interval: currentPrice * 0.1, // 10% interval
          rSquared: 1, // Perfect fit (only one point)
          dataPoints: 1
        },
        trend: 'stable',
        regression: {
          slope: 0,
          intercept: currentPrice,
          correlation: 0
        },
        singleDataPoint: true // Flag to indicate this is based on a single data point
      };
    }
    
    // Perform regression
    const regression = performLinearRegression(filteredHistory);
    
    // Calculate prediction
    const latestDate = new Date(Math.max(...filteredHistory.map(item => new Date(item.created_at))));
    const daysSinceFirst = (latestDate - regression.firstDate) / (1000 * 60 * 60 * 24);
    const predictedPrice = regression.slope * (daysSinceFirst + daysInFuture) + regression.intercept;
    
    // Calculate confidence interval (simple approach)
    const confidenceInterval = (1 - regression.rSquared) * regression.priceRange.max * 0.5;
    
    // Calculate trend description
    let trend = 'stable';
    if (regression.slope > 0.01) trend = 'increasing';
    if (regression.slope < -0.01) trend = 'decreasing';
    
    // Calculate confidence score (0-100)
    const confidenceScore = Math.min(100, Math.max(0, Math.round(regression.rSquared * 100)));
    
    return {
      success: true,
      item: itemName,
      currentPrice: filteredHistory[0].price,
      predictedPrice: Math.max(0, predictedPrice), // Ensure price is not negative
      daysInFuture,
      predictionDate: new Date(latestDate.getTime() + daysInFuture * 24 * 60 * 60 * 1000).toISOString(),
      confidence: {
        score: confidenceScore,
        interval: confidenceInterval,
        rSquared: regression.rSquared,
        dataPoints: regression.dataPoints
      },
      trend,
      regression: {
        slope: regression.slope,
        intercept: regression.intercept,
        correlation: regression.correlation
      }
    };
  } catch (error) {
    console.error(`Error predicting price for ${itemName}:`, error);
    return {
      success: false,
      message: `Error predicting price: ${error.message}`,
      error: error.message
    };
  }
}

module.exports = {
  predictPrice,
  performLinearRegression
};