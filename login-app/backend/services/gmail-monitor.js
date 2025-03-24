const { google } = require('googleapis');
const { promisify } = require('util');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const pool = require('../db');
const { sendEmail } = require('./email-service');
const { parseQuotation, isQuotationRequest } = require('../utils/Chatgpt'); 
const { predictPrice } = require('../services/price-prediction');
const { enhancedPredictPrice } = require('../services/advanced-price-prediction');

// Gmail API credentials
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const TOKEN_PATH = path.join(__dirname, '../token.json');
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'];

/**
 * Get and store new token after prompting for user authorization
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for
 */
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  console.log('Authorize this app by visiting this url:', authUrl);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const getCode = promisify(rl.question).bind(rl);
  const code = await getCode('Enter the code from that page here: ');
  rl.close();
  
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    
    // Store the token to disk for later program executions
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('Token stored to', TOKEN_PATH);
    
    return oAuth2Client;
  } catch (error) {
    console.error('Error retrieving access token', error);
    throw error;
  }
}

/**
 * Create an OAuth2 client with the given credentials
 * @param {Object} credentials The authorization client credentials
 */
async function authorize(credentials) {
  try {
    console.log('Credentials file loaded successfully');
    
    // Fix for web credentials format
    if (credentials.web) {
      const { client_secret, client_id, redirect_uris } = credentials.web;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      
      try {
        // Check if we have previously stored a token
        if (fs.existsSync(TOKEN_PATH)) {
          const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
          oAuth2Client.setCredentials(token);
          return oAuth2Client;
        } else {
          return getNewToken(oAuth2Client);
        }
      } catch (error) {
        console.error('Error loading token file:', error);
        throw error;
      }
    } else {
      console.error('Invalid credentials format. Expected "web" property.');
      throw new Error('Invalid credentials format. Expected "web" property.');
    }
  } catch (error) {
    console.error('Error in authorize function:', error);
    throw error;
  }
}

/**
 * Get unread messages from Gmail
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client
 */
async function getUnreadMessages(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  try {
    console.log('Searching for unread emails with "quotation" in the subject...');
    
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'subject:quotation is:unread label:inbox',
    });
    
    const messages = res.data.messages;
    
    if (!messages || messages.length === 0) {
      console.log('No unread quotation messages found.');
      return [];
    }
    
    console.log(`Found ${messages.length} unread quotation messages.`);
    
    const messageDetails = [];
    
    for (const message of messages) {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });
      
      messageDetails.push(details.data);
    }
    
    return messageDetails;
  } catch (error) {
    console.error('Error retrieving messages:', error);
    throw error;
  }
}

/**
 * Mark a message as read
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client
 * @param {string} messageId The ID of the message to mark as read
 */
async function markMessageAsRead(auth, messageId) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
    
    console.log(`Message ${messageId} marked as read.`);
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

/**
 * Extract email details from message
 * @param {Object} message The message object from Gmail API
 */
function extractEmailDetails(message) {
  const headers = message.payload.headers;
  const subject = headers.find(header => header.name === 'Subject')?.value || '';
  const from = headers.find(header => header.name === 'From')?.value || '';
  const to = headers.find(header => header.name === 'To')?.value || '';
  const date = headers.find(header => header.name === 'Date')?.value || '';
  
  let body = '';
  
  if (message.payload.parts) {
    // Multipart message
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body.data) {
        const buff = Buffer.from(part.body.data, 'base64');
        body += buff.toString();
      }
    }
  } else if (message.payload.body && message.payload.body.data) {
    // Single part message
    const buff = Buffer.from(message.payload.body.data, 'base64');
    body = buff.toString();
  }
  
  return {
    id: message.id,
    threadId: message.threadId,
    subject,
    from,
    to,
    date,
    body,
  };
}

/**
 * Process a quotation request email
 * @param {Object} message The message object from Gmail API
 */
async function processQuotationRequest(message) {
  // Start timer for benchmarking
  const startTime = performance.now();
  let processingSteps = {
    extraction: 0,
    prediction: 0,
    database: 0,
    emailSending: 0
  };
  
  try {
    // Extraction timing
    const extractionStart = performance.now();
    const emailDetails = extractEmailDetails(message);
    console.log('Processing potential quotation request:', emailDetails.subject);
    
    // Use ChatGPT to check if this is a quotation request
    const isQuotationResult = await isQuotationRequest(emailDetails.body);
    console.log('Is quotation request (ChatGPT):', isQuotationResult);
    
    if (isQuotationResult.toLowerCase() !== 'yes') {
      console.log('Not a quotation request according to ChatGPT, skipping.');
      return;
    }
    
    console.log('Identified as quotation request by ChatGPT.');
    
    // Use ChatGPT to parse the quotation
    console.log('Parsing quotation with ChatGPT...');
    const parsedQuotation = await parseQuotation(emailDetails.body);
    console.log('Parsed quotation:', parsedQuotation);
    processingSteps.extraction = performance.now() - extractionStart;
    
    // Extract customer information directly from email headers
    let items = [];
    let customerEmail = '';
    let companyName = '';
    
    // Extract sender information from the "From" header
    // Format is typically: "Company Name <email@example.com>"
    const fromHeader = emailDetails.from;
    console.log('From header:', fromHeader);
    
    // Extract email address
    const emailMatch = fromHeader.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
    if (emailMatch) {
      customerEmail = emailMatch[0];
    }
    
    // Extract company name from the "From" header
    const companyMatch = fromHeader.match(/^([^<]+)</);
    if (companyMatch && companyMatch[1]) {
      companyName = companyMatch[1].trim();
    } else {
      // If no company name in standard format, try to extract from email domain
      const domainMatch = customerEmail.match(/@([^.]+)/);
      if (domainMatch && domainMatch[1]) {
        companyName = domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
      }
    }
    
    console.log('Extracted company name:', companyName);
    console.log('Extracted customer email:', customerEmail);
    
    // Process items from parsed quotation
    if (Array.isArray(parsedQuotation)) {
      // If parsedQuotation is already an array of items
      items = parsedQuotation.map(item => ({
        name: item.item || item.name || '',
        quantity: item.quantity || 1,
        price: null,
        confidenceScore: 0
      }));
    } else if (parsedQuotation && typeof parsedQuotation === 'object') {
      // If parsedQuotation is an object with items
      items = (parsedQuotation.items || []).map(item => ({
        name: item.item || item.name || '',
        quantity: item.quantity || 1,
        price: null,
        confidenceScore: 0
      }));
    }
    
    console.log('Final customer email:', customerEmail);
    console.log('Final company name:', companyName);
    console.log('Extracted items:', items);
    
    if (items.length === 0) {
      console.log('No items found in the email, skipping.');
      return;
    }
    
    // Price prediction timing
    const predictionStart = performance.now();
    // Use predictPrice for each item
    for (const item of items) {
      try {
        console.log(`Predicting price for item: ${item.name}`);
        
        // Use enhanced prediction instead of basic prediction
        const prediction = await enhancedPredictPrice(item.name, 0, 365);
        
        if (prediction && prediction.success) {
          console.log(`Enhanced price prediction for ${item.name}:`, {
            price: prediction.predictedPrice,
            confidence: prediction.confidence.score / 100,
            models: prediction.models
          });
          
          item.price = prediction.predictedPrice;
          item.confidenceScore = prediction.confidence.score / 100;
          item.predictionDetails = {
            rSquared: prediction.confidence.rSquared,
            dataPoints: prediction.confidence.dataPoints,
            modelAgreement: prediction.confidence.modelAgreement,
            models: prediction.models
          };
        } else {
          console.log(`No prediction available for ${item.name}:`, prediction.message || 'Unknown error');
        }
      } catch (error) {
        console.error(`Error predicting price for ${item.name}:`, error);
      }
    }
    processingSteps.prediction = performance.now() - predictionStart;
    
    // Check if we should send an auto-reply based on confidence scores
    const highConfidenceItems = items.filter(item => item.confidenceScore >= 0.80).length;
    const confidenceRatio = items.length > 0 ? highConfidenceItems / items.length : 0;
    const canAutoReply = confidenceRatio >= 0.80 && customerEmail;
    
    // Database operations timing
    const databaseStart = performance.now();
    // Save quotation to database with auto_generated flag based on confidence
    const quotationId = await saveQuotation(customerEmail, companyName, emailDetails.subject, items, canAutoReply);
    processingSteps.database = performance.now() - databaseStart;
    
    if (canAutoReply) {
      console.log('All items have high confidence scores (>=0.80), sending auto-reply.');
      
      // Email sending timing
      const emailStart = performance.now();
      try {
        await emailCustomer(customerEmail, quotationId, items);
        console.log('Auto-reply email sent successfully.');
        
        // Update quotation status to 'completed'
        await pool.query(
          'UPDATE quotations SET status = ?, updated_at = NOW() WHERE id = ?',
          ['completed', quotationId]
        );
        
        console.log(`Quotation #${quotationId} marked as completed.`);
        processingSteps.emailSending = performance.now() - emailStart;
      } catch (error) {
        console.error('Failed to send auto-reply email:', error);
        processingSteps.emailSending = performance.now() - emailStart;
      }
    } else {
      console.log('Some items have low confidence scores or missing customer email, manual review required.');
    }
    
    // Calculate total processing time
    const endTime = performance.now();
    const totalProcessingTime = endTime - startTime;
    
    // Log performance metrics
    console.log('===== PERFORMANCE METRICS =====');
    console.log(`Total processing time: ${totalProcessingTime.toFixed(2)}ms`);
    console.log(`Email extraction: ${processingSteps.extraction.toFixed(2)}ms (${(processingSteps.extraction/totalProcessingTime*100).toFixed(1)}%)`);
    console.log(`Price prediction: ${processingSteps.prediction.toFixed(2)}ms (${(processingSteps.prediction/totalProcessingTime*100).toFixed(1)}%)`);
    console.log(`Database operations: ${processingSteps.database.toFixed(2)}ms (${(processingSteps.database/totalProcessingTime*100).toFixed(1)}%)`);
    if (canAutoReply) {
      console.log(`Email sending: ${processingSteps.emailSending.toFixed(2)}ms (${(processingSteps.emailSending/totalProcessingTime*100).toFixed(1)}%)`);
    }
    console.log('===============================');

    return quotationId;
  } catch (error) {
    console.error('Error processing quotation request:', error);
    
    // Calculate total processing time even on error
    const endTime = performance.now();
    const totalProcessingTime = endTime - startTime;
    console.log(`Processing failed after ${totalProcessingTime.toFixed(2)}ms`);
    
    throw error;
  }
}


/**
 * Save quotation to database
 * @param {string} customerEmail Customer email
 * @param {string} companyName Company name
 * @param {string} emailSubject Email subject
 * @param {Array} items Items in the quotation
 */
async function saveQuotation(customerEmail, companyName, emailSubject, items, autoGenerated = false) {
  try {
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Calculate total
      let total = 0;
      for (const item of items) {
        if (item.price !== null) {
          total += item.price * item.quantity;
        }
      }
      
      // Calculate overall confidence score (average of item confidence scores)
      const totalConfidence = items.reduce((sum, item) => sum + (item.confidenceScore || 0), 0);
      const averageConfidence = items.length > 0 ? Math.floor((totalConfidence / items.length) * 100) : 0;
      
      // Insert quotation - matching your actual table structure
      const [quotationResult] = await connection.query(
        `INSERT INTO quotations 
         (company_name, order_date, status, source, email_subject, customer_email, 
          confidence_score, auto_generated, created_at, updated_at) 
         VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          companyName, 
          'pending', 
          'email', 
          emailSubject, 
          customerEmail, 
          averageConfidence,
          autoGenerated ? 1 : 0 // Set auto_generated based on confidence
        ]
      );
      
      const quotationId = quotationResult.insertId;
      
      // Insert items
      for (const item of items) {
        // Convert confidence score from 0-1 to 0-100
        const itemConfidenceScore = Math.floor((item.confidenceScore || 0) * 100);
        
        // Check if price was automatically matched with high confidence
        const autoMatched = (item.price !== null && itemConfidenceScore >= 80) ? 1 : 0;
        
        await connection.query(
          `INSERT INTO quotation_items 
           (quotation_id, item_name, quantity, price, status, confidence_score, 
            auto_matched, original_text, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            quotationId, 
            item.name, 
            item.quantity, 
            item.price || null, 
            'not sent',
            itemConfidenceScore,
            autoMatched,
            item.original_text || item.name,
          ]
        );
      }
      
      // Commit transaction
      await connection.commit();
      connection.release();
      
      console.log(`Quotation #${quotationId} saved to database.`);
      return quotationId;
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error saving quotation to database:', error);
    throw error;
  }
}
/**
 * Send email to customer with quotation details
 * @param {string} email Customer email
 * @param {number} quotationId Quotation ID
 * @param {Array} items Items in the quotation
 */
async function emailCustomer(email, quotationId, items) {
  try {
    console.log(`Sending email to customer: ${email}`);
    console.log(`Quotation ID: ${quotationId}`);
    console.log(`Items: ${JSON.stringify(items)}`);
    
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseInt(item.quantity)), 0).toFixed(2);
    
    const subject = `Quotation #${quotationId} from Your Company`;
    const body = `Dear Customer,

Thank you for your quotation request. Please find below our quotation:

${items.map(item => `${item.quantity} x ${item.name}: $${parseFloat(item.price || 0).toFixed(2)}`).join('\n')}

Total: $${total}

This quotation is valid for 30 days.

Best regards,
Your Company`;

    // Use your email service to send the email
    const result = await sendEmail(email, subject, body);
    
    console.log('Auto-reply email sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending auto-reply email:', error);
    throw error;
  }
}

/**
 * Main function to monitor Gmail for quotation requests
 */
async function monitorGmail() {
  try {
    console.log('Starting Gmail monitoring...');
    
    // Load client secrets from file
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    
    // Authorize a client with credentials
    const auth = await authorize(credentials);
    
    // Get unread messages
    const messages = await getUnreadMessages(auth);
    
    // Process each message
    for (const message of messages) {
      try {
        // Process the message
        await processQuotationRequest(message);
        
        // Mark the message as read
        await markMessageAsRead(auth, message.id);
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
        // Continue with next message
      }
    }
    
    console.log('Gmail monitoring completed.');
  } catch (error) {
    console.error('Error in Gmail monitoring:', error);
  }
}

/**
 * Start monitoring Gmail at regular intervals
 * @param {number} intervalMinutes The interval in minutes
 */
function startMonitoring(intervalMinutes = 0.5) {
  console.log(`Starting Gmail monitoring every ${intervalMinutes} minutes...`);
  
  // Run immediately
  monitorGmail();
  
  // Then run at regular intervals
  setInterval(monitorGmail, intervalMinutes * 60 * 1000);
}

// Export functions
module.exports = {
  monitorGmail,
  startMonitoring,
  processQuotationRequest,
  emailCustomer
};