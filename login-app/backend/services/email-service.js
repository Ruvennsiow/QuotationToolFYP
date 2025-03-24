const nodemailer = require('nodemailer');

// Set up transporter for sending emails with your working credentials
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ruvenn1206@gmail.com',
    pass: 'yjus nkzt zomi pnfu',
  },
});

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body (text)
 * @param {string} html - Optional HTML version of the email
 * @param {Array} attachments - Optional attachments
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendEmail = async (to, subject, body, html = null, attachments = []) => {
  console.log('Email service sending email to:', to);
  console.log('Email subject:', subject);
  
  try {
    // Create mail options
    const mailOptions = {
      from: 'ruvenn1206@gmail.com',
      to,
      subject,
      text: body
    };
    
    // Add HTML version if provided
    if (html) {
      mailOptions.html = html;
    }
    
    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test the email configuration
 * @returns {Promise<boolean>} - Whether the test was successful
 */
const testEmailConfig = async () => {
  try {
    // Verify connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
    return false;
  }
};

// Export functions
module.exports = {
  sendEmail,
  testEmailConfig
};