const BASE_URL = require('./config');
const fs = require('fs');
const { google } = require('googleapis');
const { parseQuotation, isQuotationRequest } = require('./Chatgpt');
const axios = require('axios');

// Scopes and token path
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

// Initialize monitoring
function initializeMonitoring() {
  // Load client secrets from credentials.json
  fs.readFile(CREDENTIALS_PATH, (err, content) => {
    if (err) {
      console.error('Error loading client secret file:', err);
      return;
    }
    authorize(JSON.parse(content), startMonitoring);
  });
}

// Authorize a client with credentials
function authorize(credentials, callback) {
  try {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        return getNewToken(oAuth2Client, callback);
      }
      
      try {
        oAuth2Client.setCredentials(JSON.parse(token));
        
        // Add token refresh handler
        oAuth2Client.on('tokens', (tokens) => {
          if (tokens.refresh_token) {
            const newToken = {
              ...JSON.parse(fs.readFileSync(TOKEN_PATH)),
              refresh_token: tokens.refresh_token,
              access_token: tokens.access_token,
              expiry_date: tokens.expiry_date,
            };
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(newToken));
            console.log('Token refreshed and saved');
          }
        });
        
        callback(oAuth2Client);
      } catch (error) {
        console.log('Error with stored token, getting new token...');
        return getNewToken(oAuth2Client, callback);
      }
    });
  } catch (error) {
    console.error('Error in authorization:', error);
  }
}

// Get new token after prompting for user authorization
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  console.log('Authorize this app by visiting this url:', authUrl);
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  readline.question('Enter the code from that page here: ', (code) => {
    readline.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token:', err);
        return;
      }
      oAuth2Client.setCredentials(token);
      
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      
      callback(oAuth2Client);
    });
  });
}

// Start monitoring Gmail
function startMonitoring(auth) {
  console.log('Starting Gmail monitoring service...');
  const gmail = google.gmail({ version: 'v1', auth });

  const checkForNewEmails = async () => {
    try {
      console.log('Checking for new emails...');
      const res = await gmail.users.messages.list({
        userId: 'me',
        q: 'subject:quotation is:unread',
      });

      const messages = res.data.messages || [];
      if (messages.length > 0) {
        console.log(`Found ${messages.length} new quotation email(s)`);

        for (const message of messages) {
          try {
            const emailContent = await fetchEmailContent(gmail, message.id);
            console.log('Processing email:', emailContent.subject);

            const isQuotation = await isQuotationRequest(emailContent.body);
            console.log('Is quotation request:', isQuotation);

            if (isQuotation.toLowerCase() === 'yes') {
              console.log('Parsing quotation content...');
              const parsedQuotation = await parseQuotation(emailContent.body);
              console.log('Parsed quotation:', parsedQuotation);

              await saveQuotationToDatabase(emailContent.from, emailContent.subject, parsedQuotation);
            }

            // Mark email as read
            await gmail.users.messages.modify({
              userId: 'me',
              id: message.id,
              requestBody: {
                removeLabelIds: ['UNREAD'],
              },
            });
            console.log(`Marked email ${message.id} as read`);
          } catch (emailError) {
            console.error('Error processing individual email:', emailError);
            continue; // Continue with next email if one fails
          }
        }
      } else {
        console.log('No new quotation emails found');
      }
    } catch (error) {
      console.error('Error checking emails:', error);
      
      if (error.message.includes('invalid_grant')) {
        console.log('Token invalid, initiating reauthentication...');
        try {
          fs.unlinkSync(TOKEN_PATH);
          console.log('Deleted invalid token');
          
          // Reload credentials and restart authorization
          const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
          authorize(credentials, startMonitoring);
        } catch (reAuthError) {
          console.error('Error during reauthentication:', reAuthError);
        }
      }
    }
  };

  // Initial check
  checkForNewEmails();

  // Set up interval for checking
  const interval = setInterval(checkForNewEmails, 60000); // Check every minute

  // Handle process termination
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('Gmail monitoring stopped');
    process.exit(0);
  });
}

// Fetch email content
async function fetchEmailContent(gmail, messageId) {
  try {
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const emailData = res.data;
    const payload = emailData.payload;
    const headers = payload.headers;

    const subject = headers.find(header => header.name.toLowerCase() === 'subject')?.value || 'No Subject';
    const from = headers.find(header => header.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
    let body = '';

    // Extract body content
    if (payload.parts) {
      const plainTextPart = payload.parts.find(part => part.mimeType === 'text/plain');
      if (plainTextPart && plainTextPart.body.data) {
        body = Buffer.from(plainTextPart.body.data, 'base64').toString('utf-8');
      }
    } else if (payload.body.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    return { subject, from, body };
  } catch (error) {
    console.error('Error fetching email content:', error);
    throw error;
  }
}

// Save quotation to database
async function saveQuotationToDatabase(sender, subject, parsedQuotation) {
  try {
    const response = await axios.post(`${BASE_URL}/quotations/from-email`, {
      sender,
      subject,
      parsedQuotation,
    });
    console.log('Quotation saved to database:', response.data);
  } catch (error) {
    console.error('Error saving to database:', error.response?.data || error.message);
    throw error;
  }
}

// Start the monitoring service
initializeMonitoring();

module.exports = { initializeMonitoring };