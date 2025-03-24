const { predictPrice } = require('./price-prediction'); // Import your existing prediction
const pool = require('../db');

/**
 * Enhanced price prediction using multiple models
 * @param {string} itemName - Name of the item to predict price for
 * @param {number} daysInFuture - Days in future to predict (0 for today)
 * @param {number} historyDays - Days of history to use
 * @returns {Promise<Object>} - Enhanced prediction result
 */
async function enhancedPredictPrice(itemName, daysInFuture = 0, historyDays = 365) {
  try {
    // Get the base prediction from your existing model
    const basePrediction = await predictPrice(itemName, daysInFuture, historyDays);
    
    // If base prediction failed, return it as is
    if (!basePrediction.success) {
      return basePrediction;
    }
    
    // Get price history data for advanced models
    const [priceHistory] = await pool.query(
      `SELECT price, DATE_FORMAT(created_at, '%Y-%m-%d') as date 
       FROM price_history 
       WHERE LOWER(item_name) = LOWER(?) 
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY created_at ASC`,
      [itemName, historyDays]
    );
    
    if (priceHistory.length < 5) {
      // Not enough data for advanced models, return base prediction
      return basePrediction;
    }
    
    // Apply multiple prediction models
    const predictions = [
      { model: 'linear', price: basePrediction.predictedPrice, weight: 0.5 },
      { model: 'movingAverage', price: calculateMovingAverage(priceHistory), weight: 0.3 },
      { model: 'seasonalAdjusted', price: calculateSeasonalAdjusted(priceHistory), weight: 0.2 }
    ];
    
    // Calculate weighted average of predictions
    const totalWeight = predictions.reduce((sum, p) => sum + p.weight, 0);
    const weightedPrice = predictions.reduce((sum, p) => sum + (p.price * p.weight), 0) / totalWeight;
    
    // Calculate confidence based on model agreement
    const priceVariance = calculateVariance(predictions.map(p => p.price));
    const modelAgreementScore = calculateModelAgreementScore(priceVariance, basePrediction.predictedPrice);
    
    // Combine with original confidence
    const combinedConfidence = Math.min(
      100, 
      Math.round((basePrediction.confidence.score * 0.7) + (modelAgreementScore * 0.3))
    );
    
    // Return enhanced prediction
    return {
      success: true,
      predictedPrice: parseFloat(weightedPrice.toFixed(2)),
      originalPrice: basePrediction.predictedPrice,
      confidence: {
        score: combinedConfidence,
        rSquared: basePrediction.confidence.rSquared,
        dataPoints: basePrediction.confidence.dataPoints,
        modelAgreement: modelAgreementScore
      },
      models: predictions.map(p => ({ name: p.model, price: p.price })),
      trend: basePrediction.trend
    };
  } catch (error) {
    console.error('Error in enhanced price prediction:', error);
    // Fall back to base prediction if available
    try {
      return await predictPrice(itemName, daysInFuture, historyDays);
    } catch (fallbackError) {
      return {
        success: false,
        message: 'Failed to predict price with advanced models',
        error: error.message
      };
    }
  }
}

/**
 * Calculate moving average price
 * @param {Array} priceHistory - Price history data
 * @returns {number} - Moving average price
 */
function calculateMovingAverage(priceHistory) {
  // Use last 5 prices or all if less than 5
  const recentPrices = priceHistory.slice(-5);
  const sum = recentPrices.reduce((total, record) => total + parseFloat(record.price), 0);
  return sum / recentPrices.length;
}

/**
 * Calculate seasonally adjusted price
 * @param {Array} priceHistory - Price history data
 * @returns {number} - Seasonally adjusted price
 */
function calculateSeasonalAdjusted(priceHistory) {
  // Simple seasonal adjustment - compare with same month last year if available
  const today = new Date();
  const currentMonth = today.getMonth();
  
  // Get current month average
  const currentMonthPrices = priceHistory.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === currentMonth;
  });
  
  if (currentMonthPrices.length === 0) {
    // Fall back to most recent price
    return parseFloat(priceHistory[priceHistory.length - 1].price);
  }
  
  const currentMonthAvg = currentMonthPrices.reduce((sum, record) => 
    sum + parseFloat(record.price), 0) / currentMonthPrices.length;
  
  return currentMonthAvg;
}

/**
 * Calculate variance of prices
 * @param {Array} prices - Array of prices
 * @returns {number} - Variance
 */
function calculateVariance(prices) {
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / prices.length;
  return variance;
}

/**
 * Calculate model agreement score
 * @param {number} variance - Variance between model predictions
 * @param {number} basePrice - Base price for reference
 * @returns {number} - Agreement score (0-100)
 */
function calculateModelAgreementScore(variance, basePrice) {
  // Lower variance means higher agreement
  const normalizedVariance = variance / (basePrice * basePrice);
  const agreementScore = Math.max(0, 100 - (normalizedVariance * 10000));
  return Math.min(100, Math.round(agreementScore));
}

module.exports = {
  enhancedPredictPrice
};