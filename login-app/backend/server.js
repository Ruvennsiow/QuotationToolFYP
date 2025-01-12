const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());
// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  let isAuthenticated = false;

  fs.createReadStream('login.csv')
    .pipe(csv())
    .on('data', (row) => {
      if (row.username === username && row.password === password) {
        isAuthenticated = true;
      }
    })
    .on('end', () => {
      if (isAuthenticated) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    });
});

// Serve inventory data
app.get('/inventory', (req, res) => {
  const inventory = [];
  fs.createReadStream('inventory.csv')
    .pipe(csv())
    .on('data', (row) => {
      inventory.push(row);
    })
    .on('end', () => {
      res.json(inventory);
    });
});

app.get('/emails', (req, res) => {
  const emails = [
    {
      subject: 'Quotation: Request for Items',
      email: 'client@example.com',
      items: [
        { name: 'Item 1', quantity: 10, supplier: 'Supplier A' },
        { name: 'Item 2', quantity: 5, supplier: 'Supplier B' },
      ],
    },
  ];
  res.json(emails);
});

// Serve item images (placeholder route for now)
app.use('/images', express.static('images'));
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
