const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * Get similar product suggestions
 * @route GET /api/similar-products
 */
router.get('/', async (req, res) => {
  try {
    const { itemName, limit = 5 } = req.query;
    
    if (!itemName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item name is required',
        suggestions: [] 
      });
    }
    
    console.log(`Finding similar products for: ${itemName}, limit: ${limit}`);
    
    // First check if the exact item exists in price history
    const [exactMatch] = await pool.query(
      `SELECT COUNT(*) as count FROM price_history WHERE LOWER(item_name) = LOWER(?)`,
      [itemName]
    );
    
    // If exact match exists, don't suggest alternatives
    if (exactMatch[0].count > 0) {
      return res.json({
        success: true,
        exactMatchFound: true,
        suggestions: []
      });
    }
    
    // Get all unique item names from price history
    const [items] = await pool.query(
      `SELECT DISTINCT item_name FROM price_history`
    );
    
    if (items.length === 0) {
      return res.json({
        success: true,
        exactMatchFound: false,
        suggestions: []
      });
    }
    
    // Calculate similarity scores
    let similarItems = [];
    try {
      similarItems = items
        .map(item => ({
          name: item.item_name,
          similarity: calculateStringSimilarity(itemName.toLowerCase(), item.item_name.toLowerCase())
        }))
        .filter(item => item.name.toLowerCase() !== itemName.toLowerCase() && item.similarity >= 0.5)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, parseInt(limit));
    } catch (err) {
      console.error('Error calculating similarity:', err);
      similarItems = [];
    }
    
    // Get latest prices for similar items
    for (const item of similarItems) {
      try {
        const [priceResult] = await pool.query(
          `SELECT price FROM price_history 
           WHERE item_name = ? 
           ORDER BY created_at DESC LIMIT 1`,
          [item.name]
        );
        
        if (priceResult.length > 0) {
          item.price = priceResult[0].price;
        } else {
          item.price = 0;
        }
      } catch (err) {
        console.error(`Error getting price for ${item.name}:`, err);
        item.price = 0;
      }
    }
    
    res.json({
      success: true,
      exactMatchFound: false,
      suggestions: similarItems
    });
  } catch (error) {
    console.error('Error finding similar products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to find similar products', 
      error: error.message,
      suggestions: []
    });
  }
});

/**
 * Helper function to calculate string similarity
 */
function calculateStringSimilarity(str1, str2) {
  // Levenshtein distance calculation
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  const levenshteinScore = 1 - (distance / maxLength);
  
  // Token similarity (common words)
  const tokens1 = str1.split(/\s+/);
  const tokens2 = str2.split(/\s+/);
  const commonTokens = tokens1.filter(token => tokens2.includes(token));
  const tokenScore = commonTokens.length / Math.max(tokens1.length, tokens2.length);
  
  // Combined score (weighted average)
  return (levenshteinScore * 0.5) + (tokenScore * 0.5);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  
  // Create matrix
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return dp[m][n];
}

module.exports = router;