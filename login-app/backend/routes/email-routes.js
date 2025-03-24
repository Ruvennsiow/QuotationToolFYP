const express = require('express');
const router = express.Router();
const emailService = require('../services/email-service');

/**
 * Route to send a simple email
 * POST /send-email
 */
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    
    // Validate required fields
    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, body'
      });
    }
    
    console.log('Received email request:');
    console.log('- To:', to);
    console.log('- Subject:', subject);
    
    // Call the email service
    const result = await emailService.sendEmail(to, subject, body);
    
    if (result.success) {
      console.log('Email sent successfully');
      res.status(200).send('Email sent successfully');
    } else {
      console.error('Email sending failed:', result.error);
      res.status(500).send('Error sending email');
    }
  } catch (error) {
    console.error('Error in send-email route:', error);
    res.status(500).send('Error sending email');
  }
});

/**
 * Test endpoint for email service
 * GET /test-email
 */
router.get('/test-email', async (req, res) => {
  try {
    // First test the SMTP connection
    const connectionTest = await emailService.testEmailConfig();
    
    if (!connectionTest) {
      return res.status(500).send('SMTP connection test failed. Check your email credentials.');
    }
    
    // Send a test email
    const result = await emailService.sendEmail(
      'ruvenn1206@gmail.com', // Send to yourself for testing
      'Test Email from API',
      'This is a test email sent from the API to verify email service is working.'
    );
    
    if (result.success) {
      res.status(200).send('Test email sent successfully');
    } else {
      res.status(500).send('Test email failed to send: ' + result.error);
    }
  } catch (error) {
    console.error('Error in test-email route:', error);
    res.status(500).send('Error testing email service: ' + error.message);
  }
});

module.exports = router;