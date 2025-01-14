const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session'); // Import express-session
const pool = require('./db');
const sendEmailRouter = require('./SendEmail'); // Import SendEmail.js

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Session Configuration
app.use(
  session({
    secret: 'your-secret-key', // Replace with a secure key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set secure: true if using HTTPS
  })
);

// Middleware to Check Authentication
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send('Unauthorized: Please log in.');
  }
};

// Fetch inventory
app.get('/inventory', isAuthenticated, async (req, res) => {
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
    const [rows] = await pool.query(
      'SELECT * FROM login WHERE username = ? AND password = ?',
      [username, password]
    );
    if (rows.length > 0) {
      req.session.user = { id: rows[0].id, username: rows[0].username }; // Store user details in session
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Error during login');
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.json({ success: true });
  });
});

// Fetch all quotations
app.get('/quotations', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM quotations');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).send('Error fetching quotations');
  }
});

// Fetch items for a specific quotation
app.get('/quotations/:id/items', isAuthenticated, async (req, res) => {
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
app.post('/quotations', isAuthenticated, async (req, res) => {
  const { companyName, orderDate, items } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO quotations (company_name, order_date) VALUES (?, ?)',
      [companyName, orderDate]
    );
    const quotationId = result.insertId;

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const [inventory] = await pool.query(
          'SELECT supplier_details FROM inventory WHERE name = ? LIMIT 1',
          [item.name]
        );
        const supplier = inventory.length > 0 ? inventory[0].supplier_details : 'No known supplier';

        await pool.query(
          'INSERT INTO quotation_items (quotation_id, item_name, quantity, price, supplier_name) VALUES (?, ?, ?, ?, ?)',
          [quotationId, item.name, item.quantity, item.price || null, supplier]
        );

        return { ...item, supplier };
      })
    );

    res.status(201).json({ success: true, quotationId, items: enrichedItems });
  } catch (error) {
    console.error('Error adding quotation:', error);
    res.status(500).send('Error adding quotation');
  }
});

// Add a new quotation from parsed JSON
app.post('/quotations/from-email', isAuthenticated, async (req, res) => {
  const { sender, subject, parsedQuotation } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO quotations (company_name, order_date) VALUES (?, ?)',
      [sender, new Date()]
    );
    const quotationId = result.insertId;

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

        return { ...item, supplier };
      })
    );

    res.status(201).json({ success: true, quotationId, items: enrichedItems });
  } catch (error) {
    console.error('Error adding quotation from email:', error);
    res.status(500).send('Error adding quotation from email');
  }
});

// Update quotation item status
app.put('/quotation-items/:id/status', isAuthenticated, async (req, res) => {
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

app.use(sendEmailRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
