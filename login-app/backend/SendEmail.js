const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();

// Set up transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email provider (e.g., Gmail, Outlook, etc.)
  auth: {
    user: 'ruvenn1206@gmail.com', // Replace with your email
    pass: 'yjus nkzt zomi pnfu', // Replace with your app password
  },
});

// Email sending route
router.post('/send-email', async (req, res) => {
  const { to, subject, body } = req.body;

  const mailOptions = {
    from: 'ruvenn1206@gmail.com', // Replace with your email
    to,
    subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

module.exports = router;
