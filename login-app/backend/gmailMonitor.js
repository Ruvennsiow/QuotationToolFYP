const BASE_URL = require('./config');
const fs = require('fs');
const { google } = require('googleapis');
const { parseQuotation, isQuotationRequest } = require('./Chatgpt'); // Import ChatGPT functions
const axios = require('axios'); // For sending POST requests to the server

// Scopes and token path
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify']; // Updated scope
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), startMonitoring);
});

// Authorize a client with credentials, then call the Gmail API.
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

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
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
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
  console.log('Monitoring Gmail for emails with "quotation" in the subject...');
  const gmail = google.gmail({ version: 'v1', auth });

  const checkForNewEmails = async () => {
    try {
      const res = await gmail.users.messages.list({
        userId: 'me',
        q: 'subject:quotation is:unread',
      });

      const messages = res.data.messages || [];
      if (messages.length > 0) {
        console.log(`Found ${messages.length} email(s) with "quotation" in the subject.`);

        for (const message of messages) {
          const emailContent = await fetchEmailContent(gmail, message.id);
          const isQuotation = await isQuotationRequest(emailContent.body);

          console.log('ChatGPT Response Content:', isQuotation);

          if (isQuotation.toLowerCase().includes('yes')) {
            console.log('Accessing ChatGPT to parse the quotation...');
            const parsedQuotation = await parseQuotation(emailContent.body);
            console.log('Parsed Quotation:', parsedQuotation);

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
          console.log(`Email with ID ${message.id} marked as read.`);
        }
      } else {
        console.log('No new emails with "quotation" in the subject.');
      }
    } catch (error) {
      console.error('Error checking emails:', error);
    }
  };

  // Check emails every minute
  setInterval(checkForNewEmails, 60000); // 60 seconds
}

// Fetch email content
async function fetchEmailContent(gmail, messageId) {
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
  });

  const emailData = res.data;
  const payload = emailData.payload;
  const headers = payload.headers;

  const subject = headers.find((header) => header.name === 'Subject')?.value || 'No Subject';
  const from = headers.find((header) => header.name === 'From')?.value || 'Unknown Sender';
  const body = payload.parts?.find((part) => part.mimeType === 'text/plain')?.body?.data || 'No Body';

  return {
    subject,
    from,
    body: Buffer.from(body, 'base64').toString('utf-8'),
  };
}

// Save quotation to the database
async function saveQuotationToDatabase(sender, subject, parsedQuotation) {
  try {
    const response = await axios.post(`${BASE_URL}/quotations/from-email`, {
      sender,
      subject,
      parsedQuotation,
    });

    console.log('Quotation successfully saved to database:', response.data);
  } catch (error) {
    console.error('Error saving quotation to database:', error.response?.data || error.message);
  }
}
