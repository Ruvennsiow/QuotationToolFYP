const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all inventory items
router.get('/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single inventory item
router.get('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new inventory item
router.post('/inventory', async (req, res) => {
  try {
    const { name, description, quantity, price, supplier } = req.body;
    
    if (!name || quantity === undefined) {
      return res.status(400).json({ message: 'Name and quantity are required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO inventory (name, description, quantity, price, supplier) VALUES (?, ?, ?, ?, ?)',
      [name, description || '', quantity, price || null, supplier || '']
    );
    
    // If price is provided, add to price history
    if (price) {
      try {
        const priceHistoryService = require('../services/price-history');
        await priceHistoryService.addPriceToHistory(name, price, 'employee');
      } catch (priceError) {
        console.error('Error adding to price history:', priceError);
        // Continue even if price history fails
      }
    }
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      description, 
      quantity, 
      price, 
      supplier 
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an inventory item
router.put('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, price, supplier } = req.body;
    
    if (!name || quantity === undefined) {
      return res.status(400).json({ message: 'Name and quantity are required' });
    }
    
    // Get the current item to check if price changed
    const [currentItems] = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
    
    if (currentItems.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    const currentItem = currentItems[0];
    
    await pool.query(
      'UPDATE inventory SET name = ?, description = ?, quantity = ?, price = ?, supplier = ? WHERE id = ?',
      [name, description || '', quantity, price || null, supplier || '', id]
    );
    
    // If price changed, add to price history
    if (price && price !== currentItem.price) {
      try {
        const priceHistoryService = require('../services/price-history');
        await priceHistoryService.addPriceToHistory(name, price, 'employee');
      } catch (priceError) {
        console.error('Error adding to price history:', priceError);
        // Continue even if price history fails
      }
    }
    
    res.json({ 
      id: parseInt(id), 
      name, 
      description, 
      quantity, 
      price, 
      supplier 
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an inventory item
router.delete('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search inventory
router.get('/inventory/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    const [rows] = await pool.query(
      'SELECT * FROM inventory WHERE name LIKE ? OR description LIKE ? OR supplier LIKE ?',
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error searching inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory by supplier
router.get('/inventory/supplier/:supplier', async (req, res) => {
  try {
    const { supplier } = req.params;
    
    const [rows] = await pool.query(
      'SELECT * FROM inventory WHERE supplier = ? ORDER BY name',
      [supplier]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inventory by supplier:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update inventory quantity
router.put('/inventory/:id/quantity', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, adjustment } = req.body;
    
    if (quantity === undefined && adjustment === undefined) {
      return res.status(400).json({ message: 'Quantity or adjustment is required' });
    }
    
    if (quantity !== undefined) {
      // Set to specific quantity
      await pool.query(
        'UPDATE inventory SET quantity = ? WHERE id = ?',
        [quantity, id]
      );
    } else {
      // Adjust by amount
      await pool.query(
        'UPDATE inventory SET quantity = quantity + ? WHERE id = ?',
        [adjustment, id]
      );
    }
    
    // Get updated item
    const [rows] = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;