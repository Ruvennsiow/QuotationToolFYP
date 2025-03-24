const express = require('express');
const router = express.Router();
const { getPriceHistory, getAveragePrice, addPriceToHistory } = require('../services/price-history');
const pool = require('../db');

// Get price history for an item
router.get('/api/price-history/:itemName', async (req, res) => {
  console.log(`Received request for price history: ${req.params.itemName}`);
  
  try {
    const { itemName } = req.params;
    const { limit } = req.query;
    
    if (!itemName) {
      console.log('Missing item name in request');
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }
    
    console.log(`Fetching price history for item: ${itemName}, limit: ${limit || 100}`);
    
    const history = await getPriceHistory(itemName, limit ? parseInt(limit) : 100);
    
    console.log(`Found ${Array.isArray(history) ? history.length : 0} price history records for ${itemName}`);
    
    // Check if the result indicates item not found
    if (history.notFound) {
      console.log(`No price history found for item: ${itemName}`);
      return res.status(404).json({
        success: false,
        message: `No price history found for item: ${itemName}`,
        itemNotFound: true
      });
    }
    
    // Make sure to return a proper response and end the request
    return res.json({
      success: true,
      item: itemName,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching price history',
      error: error.message
    });
  }
});

// Get average price for an item
router.get('/api/price-history/:itemName/average', async (req, res) => {
  console.log(`Received request for average price: ${req.params.itemName}`);
  
  try {
    const { itemName } = req.params;
    const { days } = req.query;
    
    if (!itemName) {
      console.log('Missing item name in request');
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }
    
    console.log(`Calculating average price for ${itemName} over ${days || 30} days`);
    
    const averageData = await getAveragePrice(itemName, days ? parseInt(days) : 30);
    
    console.log(`Average price calculation results for ${itemName}:`, averageData);
    
    // Check if the result indicates item not found
    if (averageData.notFound) {
      console.log(`No price data found for ${itemName}`);
      return res.status(404).json({
        success: false,
        message: averageData.message,
        itemNotFound: true
      });
    }
    
    // Make sure to return a proper response and end the request
    return res.json({
      success: true,
      item: itemName,
      ...averageData
    });
  } catch (error) {
    console.error('Error fetching average price:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching average price',
      error: error.message
    });
  }
});

// Add a new price to history
router.post('/api/price-history', async (req, res) => {
  console.log('Received request to add price history:', req.body);
  
  try {
    const { itemName, price, source, confidenceScore } = req.body;
    
    if (!itemName) {
      console.log('Missing item name in request');
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }
    
    if (price === undefined || price === null || isNaN(parseFloat(price))) {
      console.log('Missing or invalid price in request');
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }
    
    if (!source || !['supplier', 'employee', 'auto'].includes(source)) {
      console.log('Missing or invalid source in request');
      return res.status(400).json({
        success: false,
        message: 'Source must be supplier, employee, or auto'
      });
    }
    
    console.log(`Adding price history for ${itemName}: $${price}, source: ${source}`);
    
    const result = await addPriceToHistory(itemName, price, source, confidenceScore);
    
    console.log(`Successfully added price history for ${itemName}:`, result);
    
    // Make sure to return a proper response and end the request
    return res.status(201).json({
      success: true,
      message: 'Price history added successfully',
      data: result
    });
  } catch (error) {
    console.error('Error adding price history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding price history',
      error: error.message
    });
  }
});

// Get unique items with price history
router.get('/api/price-history', async (req, res) => {
  console.log('Received request for unique items with price history');
  
  try {
    const pool = require('../db');
    
    const [rows] = await pool.query(
      'SELECT DISTINCT item_name FROM price_history ORDER BY item_name'
    );
    
    console.log(`Found ${rows.length} unique items with price history`);
    
    // Make sure to return a proper response and end the request
    return res.json({
      success: true,
      count: rows.length,
      items: rows.map(row => row.item_name)
    });
  } catch (error) {
    console.error('Error fetching unique items:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching unique items',
      error: error.message
    });
  }
});
router.get('/api/price/check', async (req, res) => {
  try {
    const { itemName } = req.query;
    
    if (!itemName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item name is required',
        exists: false,
        count: 0
      });
    }
    
    console.log(`Checking price history for item: ${itemName}`);
    
    // Check if price history exists
    const [result] = await pool.query(
      `SELECT COUNT(*) as count FROM price_history WHERE LOWER(item_name) = LOWER(?)`,
      [itemName]
    );
    
    const exists = result[0].count > 0;
    console.log(`Found ${result[0].count} price history records for ${itemName}`);
    
    res.json({
      success: true,
      exists,
      count: result[0].count
    });
  } catch (error) {
    console.error('Error checking price history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check price history', 
      error: error.message,
      exists: false,
      count: 0
    });
  }
});

/**
 * Get price history for an item
 * @route GET /api/price/history/:itemName
 */
router.get('/api/price/history/:itemName', async (req, res) => {
  try {
    const { itemName } = req.params;
    const limit = req.query.limit || 100;
    
    console.log(`Fetching price history for item: ${itemName}, limit: ${limit}`);
    
    const [rows] = await pool.query(
      `SELECT * FROM price_history 
       WHERE LOWER(item_name) = LOWER(?) 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [itemName, parseInt(limit)]
    );
    
    console.log(`Found ${rows.length} price history records`);
    
    res.json({
      success: true,
      priceHistory: rows
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch price history', 
      error: error.message 
    });
  }
});
module.exports = router;