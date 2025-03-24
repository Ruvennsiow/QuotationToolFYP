const express = require('express');
const router = express.Router();
const { predictPrice } = require('../services/price-prediction');
const pool = require('../db');

// Get price prediction for an item
router.get('/api/price-prediction/:itemName', async (req, res) => {
  console.log(`Received request for price prediction: ${req.params.itemName}`);
  
  try {
    const { itemName } = req.params;
    const { days, history } = req.query;
    
    if (!itemName) {
      console.log('Missing item name in request');
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }
    
    console.log(`Predicting price for item: ${itemName}, days: ${days || 30}, history: ${history || 365}`);
    
    const prediction = await predictPrice(
      itemName, 
      days ? parseInt(days) : 30,
      history ? parseInt(history) : 365
    );
    
    if (!prediction.success) {
      if (prediction.itemNotFound) {
        return res.status(404).json(prediction);
      }
      // Don't return 400 for insufficient data anymore
      return res.status(500).json(prediction);
    }
    
    console.log(`Price prediction for ${itemName}: $${prediction.predictedPrice.toFixed(2)}`);
    
    return res.json(prediction);
  } catch (error) {
    console.error('Error generating price prediction:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating price prediction',
      error: error.message
    });
  }
});

// Update price history for a quotation
router.post('/api/quotations/:id/update-price-history', async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    
    console.log(`Updating price history for quotation ${id} with ${items.length} items`);
    
    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid items data'
      });
    }
    
    // Record each price in the price history
    for (const item of items) {
      // Insert the price history record
      await pool.query(
        `INSERT INTO price_history 
         (item_name, price, source, reference_id, created_at) 
         VALUES (?, ?, 'quotation', ?, NOW())`,
        [item.item_name, item.price, id]
      );
      
      console.log(`Recorded price history for ${item.item_name}: $${item.price}`);
    }
    
    return res.json({
      success: true,
      message: 'Price history updated successfully',
      quotationId: id,
      itemsUpdated: items.length
    });
    
  } catch (error) {
    console.error('Error updating price history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating price history',
      error: error.message
    });
  }
});

module.exports = router;