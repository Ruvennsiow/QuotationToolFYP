const axios = require('axios');

// OpenAI API configuration
const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Check if the email is a quotation request
async function isQuotationRequest(emailBody) {
  console.log('Accessing ChatGPT to determine if the email is a quotation request...');
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: `Analyze this email strictly as either quotation request (yes) or not (no). 
Rules:
1. Respond ONLY 'yes' or 'no'
2. 'yes' = explicit OR implicit price/quote request
3. Examples of "yes":
   - "Please provide your best price for 100 units"
   - "Kindly send quotation for office chairs"
   - "Need formal quote for construction materials"
   - "What's the cost of..."
   - "Looking for pricing details"
   - "Can you tell me the price?"
   - "Interested in purchasing, what's the rate?"
   - "Please send me a quote"
   - "Can you provide a quote?"
   - "Your quoted prices from Q1 are outdated – need 2024 figures."
   - "Can you requote the project with faster shipping?"
4. Examples of "no":
   - "Your quoted price from last week..."
   - "Invoice #123 attached for payment"
   - "Discuss pricing in tomorrow's meeting"
5. When in doubt, respond 'yes'
6. Only classify as 'no' if ABSOLUTELY CERTAIN it's not a quote request
7. Remember: false negatives are MORE COSTLY than false positives

Email: "${emailBody}"
Answer ONLY 'yes' or 'no':`
          },
          { role: 'user', content: emailBody },
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
          model: 'gpt-4',
          messages: [
            { 
              role: 'system', 
              content: 'You are an AI trained to extract product requests from emails. Your task is to identify items being requested and their quantities. Format the output as a JSON array where each object has an "id" (starting from 1), "item" (the product name), and "quantity" (the requested amount). If no specific quantity is mentioned, use 1 as the default. Only include the JSON array in your response, nothing else.' 
            },
            { role: 'user', content: emailBody },
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