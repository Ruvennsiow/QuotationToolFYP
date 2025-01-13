const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db');

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
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
