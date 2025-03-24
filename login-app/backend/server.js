const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const { startMonitoring } = require('./services/gmail-monitor'); // Import the correct function
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies (with increased limit for larger payloads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import ALL routes
const authRoutes = require('./routes/auth-routes');
const quotationRoutes = require('./routes/quotation-routes');
const priceRoutes = require('./routes/price-routes');
const inventoryRoutes = require('./routes/inventory-routes');
const emailRoutes = require('./routes/email-routes');
const predictionRoutes = require('./routes/prediction-routes');
const autoQuotationRoutes = require('./routes/auto-quotation-routes');
const similarProductsRoutes = require('./routes/similar-products-routes');

// Debug route to list all registered routes
app.get('/api/debug', (req, res) => {
  const routes = [];
  
  // Get routes from the app
  app._router.stack.forEach(middleware => {
    if(middleware.route) { // routes registered directly on the app
      routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    } else if(middleware.name === 'router') { // router middleware
      middleware.handle.stack.forEach(handler => {
        if(handler.route) {
          const methods = Object.keys(handler.route.methods)
            .filter(method => handler.route.methods[method])
            .map(method => method.toUpperCase());
          routes.push(`${methods.join(',')} ${handler.route.path}`);
        }
      });
    }
  });
  
  res.json({ 
    message: 'API is working!',
    routes: routes
  });
});

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// Direct email sending route (as a fallback)
app.post('/send-email', async (req, res) => {
  console.log('Received direct email request');
  try {
    const { to, subject, body } = req.body;
    
    // Validate required fields
    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, body'
      });
    }
    
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    
    // For now, just simulate sending an email
    console.log('Email would be sent with body:', body.substring(0, 100) + '...');
    
    // In a real implementation, you would use nodemailer here
    // const transporter = nodemailer.createTransport({...});
    // const info = await transporter.sendMail({...});
    
    return res.json({
      success: true,
      message: 'Email sent successfully (simulated)',
      to: to,
      subject: subject
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message
    });
  }
});

// Mount ALL routes
app.use('/', authRoutes);
app.use('/', quotationRoutes);
app.use('/', priceRoutes);
app.use('/', inventoryRoutes);
app.use('/', emailRoutes);
app.use('/', predictionRoutes);
app.use('/', autoQuotationRoutes);
app.use('/', similarProductsRoutes);
// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Handle 404 errors
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Debug route available at: http://localhost:${PORT}/api/debug`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`Email sending available at: http://localhost:${PORT}/send-email`);
  
  // Check for credentials.json instead of environment variables
  const fs = require('fs');
  if (fs.existsSync('credentials.json')) {
    console.log('Starting Gmail monitoring service...');
    // Replace initializeMonitoring with startMonitoring
    startMonitoring(0.5); // Start monitoring every 5 minutes
  } else {
    console.log('credentials.json not found, Gmail monitoring not started');
  }
});

module.exports = app;