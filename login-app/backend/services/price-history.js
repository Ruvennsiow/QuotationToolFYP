const pool = require('../db');

/**
 * Add a price to the price history
 * @param {string} itemName - The name of the item
 * @param {number} price - The price of the item
 * @param {string} source - The source of the price (supplier, employee, auto, quotation)
 * @param {number} confidenceScore - Optional confidence score for auto-detected prices
 * @returns {Promise<Object>} - The inserted price history record
 */
async function addPriceToHistory(itemName, price, source, confidenceScore = null) {
  try {
    console.log(`Adding price history for ${itemName}: $${price}, source: ${source}`);
    
    // Validate source - now includes 'quotation' as a valid source
    const validSources = ['supplier', 'employee', 'auto', 'quotation'];
    if (!validSources.includes(source)) {
      throw new Error(`Invalid source: ${source}. Must be one of: ${validSources.join(', ')}`);
    }
    
    // Insert the price history record - without reference_id
    const [result] = await pool.query(
      `INSERT INTO price_history 
       (item_name, price, source, created_at, confidence_score) 
       VALUES (?, ?, ?, NOW(), ?)`,
      [itemName, price, source, confidenceScore]
    );
    
    console.log(`Price history added for ${itemName}: $${price}`);
    return { id: result.insertId, itemName, price, source };
  } catch (error) {
    console.error(`Error adding price history for ${itemName}:`, error);
    throw error;
  }
}

/**
 * Get price history for an item
 * @param {string} itemName - The name of the item
 * @param {number} limit - Optional limit on number of records to return
 * @returns {Promise<Array>} - Array of price history records
 */
async function getPriceHistory(itemName, limit = 10) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM price_history 
       WHERE item_name = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [itemName, limit]
    );
    return rows;
  } catch (error) {
    console.error(`Error getting price history for ${itemName}:`, error);
    throw error;
  }
}

/**
 * Get average price for an item
 * @param {string} itemName - The name of the item
 * @param {number} days - Optional number of days to look back
 * @returns {Promise<number>} - Average price
 */
async function getAveragePrice(itemName, days = 30) {
  try {
    const [rows] = await pool.query(
      `SELECT AVG(price) as average_price 
       FROM price_history 
       WHERE item_name = ? 
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [itemName, days]
    );
    
    return rows[0].average_price || null;
  } catch (error) {
    console.error(`Error getting average price for ${itemName}:`, error);
    throw error;
  }
}

module.exports = {
  addPriceToHistory,
  getPriceHistory,
  getAveragePrice
};