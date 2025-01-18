const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db');
const sendEmailRouter = require('./SendEmail'); // Import SendEmail.js
const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

// Fetch inventory
app.get('/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).send('Error fetching inventory');
  }
});
// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM login WHERE username = ? AND password = ?', [username, password]);
    if (rows.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Error during login');
  }
});
// Fetch all quotations
app.get('/quotations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM quotations');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).send('Error fetching quotations');
  }
});
// Fetch items for a specific quotation
app.get('/quotations/:id/items', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching quotation items:', error);
    res.status(500).send('Error fetching quotation items');
  }
});
// Add a new quotation
app.post('/quotations', async (req, res) => {
  const { companyName, orderDate, items } = req.body;

  try {
    // Insert the new quotation
    const [result] = await pool.query(
      'INSERT INTO quotations (company_name, order_date) VALUES (?, ?)',
      [companyName, orderDate]
    );
    const quotationId = result.insertId;

    // Enrich items with supplier information from the inventory table
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const [inventory] = await pool.query(
          'SELECT supplier_details FROM inventory WHERE name = ? LIMIT 1',
          [item.name]
        );
        const supplier = inventory.length > 0 ? inventory[0].supplier_details : 'No known supplier';

        // Insert the item into quotation_items table
        await pool.query(
          'INSERT INTO quotation_items (quotation_id, item_name, quantity, price, supplier_name) VALUES (?, ?, ?, ?, ?)',
          [quotationId, item.name, item.quantity, item.price || null, supplier]
        );

        return { ...item, supplier }; // Add supplier information to the item
      })
    );

    res.status(201).json({ success: true, quotationId, items: enrichedItems });
  } catch (error) {
    console.error('Error adding quotation:', error);
    res.status(500).send('Error adding quotation');
  }
});
// Update quotation items
app.put('/quotations/:id/items', async (req, res) => {
  const { id } = req.params; // Quotation ID
  const items = req.body; // Array of updated items

  try {
    // Update each item's price in the database
    const updateQueries = items.map((item) =>
      pool.query(
        'UPDATE quotation_items SET price = ? WHERE quotation_id = ? AND item_name = ?',
        [item.price, id, item.item_name]
      )
    );

    await Promise.all(updateQueries);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating quotation items:', error);
    res.status(500).send('Error updating quotation items');
  }
});
// Add a new quotation from parsed JSON
app.post('/quotations/from-email', async (req, res) => {
  const { sender, subject, parsedQuotation } = req.body; // Get sender, subject, and parsed items

  try {
    // Insert the new quotation
    const [result] = await pool.query(
      'INSERT INTO quotations (company_name, order_date) VALUES (?, ?)',
      [sender, new Date()] // Use sender as company_name and current date as order_date
    );
    const quotationId = result.insertId;

    // Enrich and insert items into the quotation_items table
    const enrichedItems = await Promise.all(
      parsedQuotation.map(async (item) => {
        const [inventory] = await pool.query(
          'SELECT supplier_details FROM inventory WHERE name = ? LIMIT 1',
          [item.item]
        );
        const supplier = inventory.length > 0 ? inventory[0].supplier_details : 'No known supplier';

        await pool.query(
          'INSERT INTO quotation_items (quotation_id, item_name, quantity, supplier_name) VALUES (?, ?, ?, ?)',
          [quotationId, item.item, item.quantity, supplier]
        );

        return { ...item, supplier }; // Add supplier information for debugging/logging
      })
    );

    res.status(201).json({ success: true, quotationId, items: enrichedItems });
  } catch (error) {
    console.error('Error adding quotation from email:', error);
    res.status(500).send('Error adding quotation from email');
  }
});
app.use(sendEmailRouter); // Use the send email router
app.put('/quotation-items/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [result] = await pool.query('UPDATE quotation_items SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).send('Item not found');
    }
    res.status(200).send('Status updated successfully');
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send('Error updating status');
  }
});
// to edit inventory
app.put('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, cost_price, selling_price, supplier_details } = req.body;
    
    // Validate the input
    if (!name || !description || !cost_price || !selling_price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Convert price values to numbers if they're strings
    const costPrice = parseFloat(cost_price);
    const sellingPrice = parseFloat(selling_price);

    const query = `
      UPDATE inventory 
      SET 
        name = ?,
        description = ?,
        cost_price = ?,
        selling_price = ?,
        supplier_details = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const values = [
      name,
      description,
      costPrice,
      sellingPrice,
      supplier_details || null,
      id
    ];

    await pool.query(query, values);

    // Fetch the updated record
    const selectQuery = 'SELECT * FROM inventory WHERE id = ?';
    const [updatedItem] = await pool.query(selectQuery, [id]);

    if (!updatedItem.length) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(updatedItem[0]);
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});
// to add inventory 
app.post('/inventory', async (req, res) => {
  try {
    const { name, description, cost_price, selling_price, supplier_details } = req.body;
    
    // Validate the input
    if (!name || !description || !cost_price || !selling_price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
      INSERT INTO inventory 
      (name, description, cost_price, selling_price, supplier_details) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      description,
      parseFloat(cost_price),
      parseFloat(selling_price),
      supplier_details || null
    ];

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 1) {
      res.status(201).json({ 
        message: 'Inventory item added successfully',
        id: result.insertId 
      });
    } else {
      res.status(400).json({ error: 'Failed to add inventory item' });
    }

  } catch (error) {
    console.error('Error adding inventory:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
