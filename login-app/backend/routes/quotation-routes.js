const express = require('express');
const router = express.Router();
const pool = require('../db');
const { addPriceToHistory } = require('../services/price-history');

// Get all quotations
router.get('/quotations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM quotations ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
});

// Get a specific quotation by ID
router.get('/quotations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM quotations WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ error: 'Failed to fetch quotation' });
  }
});

// Create a new quotation
router.post('/quotations', async (req, res) => {
  try {
    const { company_name, order_date, status = 'pending' } = req.body;
    
    if (!company_name) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO quotations (company_name, order_date, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [company_name, order_date, status]
    );
    
    res.status(201).json({
      id: result.insertId,
      company_name,
      order_date,
      status,
      message: 'Quotation created successfully'
    });
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ error: 'Failed to create quotation' });
  }
});

// Update a quotation
router.put('/quotations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, order_date, status } = req.body;
    
    if (!company_name) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    await pool.query(
      'UPDATE quotations SET company_name = ?, order_date = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [company_name, order_date, status, id]
    );
    
    res.json({
      id,
      company_name,
      order_date,
      status,
      message: 'Quotation updated successfully'
    });
  } catch (error) {
    console.error('Error updating quotation:', error);
    res.status(500).json({ error: 'Failed to update quotation' });
  }
});

// Delete a quotation and all its items
router.delete('/api/quotations/:id', async (req, res) => {
  try {
    const quotationId = req.params.id;
    console.log(`Attempting to delete quotation #${quotationId} and all its items`);
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // First delete related items from quotation_items
      const [itemsResult] = await connection.query(
        'DELETE FROM quotation_items WHERE quotation_id = ?',
        [quotationId]
      );
      
      console.log(`Deleted ${itemsResult.affectedRows} items from quotation_items table`);
      
      // Then delete the quotation
      const [quotationResult] = await connection.query(
        'DELETE FROM quotations WHERE id = ?',
        [quotationId]
      );
      
      // Commit the transaction
      await connection.commit();
      connection.release();
      
      if (quotationResult.affectedRows === 0) {
        console.log(`Quotation #${quotationId} not found`);
        return res.status(404).json({ 
          success: false, 
          message: 'Quotation not found' 
        });
      }
      
      console.log(`Successfully deleted quotation #${quotationId} and ${itemsResult.affectedRows} related items`);
      
      res.json({ 
        success: true, 
        message: `Quotation #${quotationId} and all its items deleted successfully`,
        deletedItems: itemsResult.affectedRows
      });
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      connection.release();
      console.error('Transaction error during deletion:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete quotation', 
      error: error.message 
    });
  }
});

// Get all items for a specific quotation
router.get('/quotations/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM quotation_items WHERE quotation_id = ?',
      [id]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching quotation items:', error);
    res.status(500).json({ error: 'Failed to fetch quotation items' });
  }
});

// Add an item to a quotation
router.post('/quotations/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, quantity, price } = req.body;
    
    if (!item_name || !quantity) {
      return res.status(400).json({ error: 'Item name and quantity are required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO quotation_items (quotation_id, item_name, quantity, price, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [id, item_name, quantity, price]
    );
    
    res.status(201).json({
      id: result.insertId,
      quotation_id: id,
      item_name,
      quantity,
      price,
      message: 'Item added successfully'
    });
  } catch (error) {
    console.error('Error adding item to quotation:', error);
    res.status(500).json({ error: 'Failed to add item to quotation' });
  }
});

// Update an item in a quotation
router.put('/quotations/:quotationId/items/:itemId', async (req, res) => {
  try {
    const { quotationId, itemId } = req.params;
    const { item_name, quantity, price } = req.body;
    
    if (!item_name || !quantity) {
      return res.status(400).json({ error: 'Item name and quantity are required' });
    }
    
    await pool.query(
      'UPDATE quotation_items SET item_name = ?, quantity = ?, price = ?, updated_at = NOW() WHERE id = ? AND quotation_id = ?',
      [item_name, quantity, price, itemId, quotationId]
    );
    
    res.json({
      id: itemId,
      quotation_id: quotationId,
      item_name,
      quantity,
      price,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Error updating quotation item:', error);
    res.status(500).json({ error: 'Failed to update quotation item' });
  }
});

// Update all items in a quotation
router.put('/quotations/:quotationId/items', async (req, res) => {
    try {
      const { quotationId } = req.params;
      const items = req.body; // Expect an array of items
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array is required' });
      }
      
      // Process each item update
      const results = [];
      for (const item of items) {
        const { id, item_name, quantity, price } = item;
        
        if (!id || !item_name || quantity === undefined) {
          return res.status(400).json({ 
            error: 'Each item must have id, name, and quantity',
            problematicItem: item 
          });
        }
        
        // Remove updated_at from the query
        await pool.query(
          'UPDATE quotation_items SET item_name = ?, quantity = ?, price = ? WHERE id = ? AND quotation_id = ?',
          [item_name, quantity, price, id, quotationId]
        );
        
        results.push({
          id,
          quotation_id: quotationId,
          item_name,
          quantity,
          price
        });
      }
      
      res.json({
        quotation_id: quotationId,
        updated_items: results,
        message: 'Items updated successfully'
      });
    } catch (error) {
      console.error('Error updating quotation items:', error);
      res.status(500).json({ error: 'Failed to update quotation items' });
    }
  });

// Delete an item from a quotation
router.delete('/quotations/:quotationId/items/:itemId', async (req, res) => {
  try {
    const { quotationId, itemId } = req.params;
    
    await pool.query(
      'DELETE FROM quotation_items WHERE id = ? AND quotation_id = ?',
      [itemId, quotationId]
    );
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting quotation item:', error);
    res.status(500).json({ error: 'Failed to delete quotation item' });
  }
});

// Send quotation to customer
router.post('/api/quotations/:id/send', async (req, res) => {
    console.log(`Received request to send quotation ${req.params.id}`);
    try {
      const { id } = req.params;
      
      console.log(`Processing quotation ${id}`);
      
      // Get the quotation details
      const [quotations] = await pool.query(
        'SELECT * FROM quotations WHERE id = ?',
        [id]
      );
      
      if (quotations.length === 0) {
        console.log(`Quotation ${id} not found`);
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }
      
      const quotation = quotations[0];
      console.log(`Found quotation: ${JSON.stringify(quotation)}`);
      
      // Get all items in the quotation
      const [items] = await pool.query(
        'SELECT * FROM quotation_items WHERE quotation_id = ?',
        [id]
      );
      
      console.log(`Found ${items.length} items for quotation ${id}`);
      
      // Record each price in the price history using the price-history service
      for (const item of items) {
        try {
          console.log(`Processing item: ${item.item_name}, price: ${item.price}`);
          
          // Use the simplified addPriceToHistory function - without reference_id
          const result = await addPriceToHistory(
            item.item_name,
            item.price,
            'quotation', // Use 'quotation' as the source
            1.0 // Confidence score of 1.0 since this is an actual quotation
          );
          
          console.log(`Recorded price history for ${item.item_name}: $${item.price}`, result);
        } catch (priceError) {
          console.error(`Error recording price history for ${item.item_name}:`, priceError);
          // Continue with other items even if one fails
        }
      }
      
      // Update the quotation status to "completed" (lowercase to match the ENUM)
      console.log(`Updating quotation ${id} status to 'completed'`);
      const [updateResult] = await pool.query(
        'UPDATE quotations SET status = ?, updated_at = NOW() WHERE id = ?',
        ['completed', id]
      );
      
      console.log(`Update result:`, updateResult);
      
      return res.json({
        success: true,
        message: 'Quotation sent to customer and marked as completed',
        quotationId: id,
        itemsUpdated: items.length
      });
      
    } catch (error) {
      console.error('Error sending quotation to customer:', error);
      return res.status(500).json({
        success: false,
        message: 'Error sending quotation to customer',
        error: error.message
      });
    }
  });

// Log all registered routes when the file is loaded
console.log('Quotation routes registered:');
router.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
  }
});
// Update your GET /api/quotations endpoint
router.get('/api/quotations', async (req, res) => {
    try {
      const [quotations] = await pool.query(
        `SELECT id, company_name, status, created_at, updated_at, 
                auto_generated, confidence_score, email_id, email_subject 
         FROM quotations 
         ORDER BY created_at DESC`
      );
      
      res.json({
        success: true,
        quotations
      });
    } catch (error) {
      console.error('Error fetching quotations:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching quotations',
        error: error.message
      });
    }
  });
  
  // Update your GET /api/quotations/:id endpoint
  router.get('/api/quotations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get quotation
      const [quotations] = await pool.query(
        `SELECT * FROM quotations WHERE id = ?`,
        [id]
      );
      
      if (quotations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }
      
      // Get quotation items
      const [items] = await pool.query(
        `SELECT * FROM quotation_items WHERE quotation_id = ?`,
        [id]
      );
      
      res.json({
        success: true,
        quotation: quotations[0],
        items
      });
    } catch (error) {
      console.error('Error fetching quotation details:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching quotation details',
        error: error.message
      });
    }
  });

module.exports = router;