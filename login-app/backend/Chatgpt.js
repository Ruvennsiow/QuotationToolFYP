const axios = require('axios');

// OpenAI API configuration
const OPENAI_API_KEY = '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'; // Replace with your OpenAI API key
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Check if the email is a quotation request
async function isQuotationRequest(emailBody) {
  console.log('Accessing ChatGPT to determine if the email is a quotation request...');
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `Is this email a quotation request? Answer "yes" or "no" only.\n\n${emailBody}` },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    console.log('ChatGPT Response Content:', response.data.choices[0].message.content.trim());
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error communicating with OpenAI:', error.response?.data || error.message);
    throw error;
  }
}

// Parse the quotation into a structured JSON format
async function parseQuotation(emailBody) {
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that parses email content into structured data.' },
            { role: 'user', content: `Extract all items from this email into a JSON with the format: [{"id": 1, "item": "item_name", "quantity": "quantity"}].\n\n${emailBody}` },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );
  
      console.log('ChatGPT Response for Quotation Parsing:', response.data);
  
      // Extract and clean the content
      let content = response.data.choices[0].message.content.trim();
  
      // Try to extract JSON if response includes extra text
      const jsonMatch = content.match(/\[.*\]/s); // Match JSON array in the response
      if (jsonMatch) {
        content = jsonMatch[0]; // Extract JSON part only
      }
  
      // Parse JSON
      return JSON.parse(content);
    } catch (error) {
      console.error('Error communicating with OpenAI:', error.response?.data || error.message);
      throw error;
    }
  }

module.exports = { isQuotationRequest, parseQuotation };
