const pool = require('../db');
const { addPriceToHistory } = require('./price-history');

/**
 * Update quotation item price
 * @param {number} quotationId - ID of the quotation
 * @param {string} itemName - Name of the item
 * @param {number} price - Price to set
 * @param {string} source - Source of the price ('supplier', 'employee', 'auto')
 * @returns {Promise<Object>} - Result of the operation
 */
async function updateQuotationItemPrice(quotationId, itemName, price, source = 'employee') {
  try {
    // Update the price in quotation_items
    await pool.query(
      'UPDATE quotation_items SET price = ? WHERE quotation_id = ? AND item_name = ?',
      [price, quotationId, itemName]
    );
    
    // Add to price history
    await addPriceToHistory(itemName, price, source);
    
    return { 
      success: true,
      message: `Price updated for ${itemName} in quotation #${quotationId}`
    };
  } catch (error) {
    console.error('Error updating quotation item price:', error);
    throw error;
  }
}

/**
 * Get quotation details with items
 * @param {number} quotationId - ID of the quotation
 * @returns {Promise<Object>} - Quotation details with items
 */
async function getQuotationWithItems(quotationId) {
  try {
    // Get quotation details
    const [quotations] = await pool.query(
      'SELECT * FROM quotations WHERE id = ?',
      [quotationId]
    );
    
    if (quotations.length === 0) {
      return { success: false, message: 'Quotation not found' };
    }
    
    // Get quotation items
    const [items] = await pool.query(
      'SELECT * FROM quotation_items WHERE quotation_id = ?',
      [quotationId]
    );
    
    return {
      success: true,
      quotation: {
        ...quotations[0],
        items
      }
    };
  } catch (error) {
    console.error('Error fetching quotation with items:', error);
    throw error;
  }
}

module.exports = {
  updateQuotationItemPrice,
  getQuotationWithItems
};