/**
 * Utility for calculating confidence scores for item matching
 */

/**
 * Calculate confidence score for an item match
 * @param {string} requestedItem - The item text from the email
 * @param {string} inventoryItem - The matched inventory item name
 * @returns {number} - Confidence score (0-100)
 */
function calculateItemConfidence(requestedItem, inventoryItem) {
    let score = 0;
    
    // Exact name match (case insensitive)
    if (requestedItem.toLowerCase() === inventoryItem.toLowerCase()) {
      score += 50;
      return 100; // Perfect match gets 100%
    } 
    
    // Partial name match
    if (inventoryItem.toLowerCase().includes(requestedItem.toLowerCase()) || 
        requestedItem.toLowerCase().includes(inventoryItem.toLowerCase())) {
      score += 30;
    }
    
    // Check for word matches
    const requestWords = requestedItem.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const itemWords = inventoryItem.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    let matchedWords = 0;
    for (const word of requestWords) {
      if (itemWords.includes(word)) {
        matchedWords++;
      }
    }
    
    // Add points based on percentage of words matched
    if (requestWords.length > 0) {
      const wordMatchPercentage = (matchedWords / requestWords.length) * 100;
      score += Math.min(40, wordMatchPercentage * 0.4);
    }
    
    return Math.min(100, Math.round(score));
  }
  
  /**
   * Calculate overall confidence for a quotation
   * @param {Array} itemConfidences - Array of confidence scores for items
   * @returns {number} - Overall confidence score (0-100)
   */
  function calculateOverallConfidence(itemConfidences) {
    if (!itemConfidences || itemConfidences.length === 0) {
      return 0;
    }
    
    // Calculate average confidence
    const sum = itemConfidences.reduce((total, score) => total + score, 0);
    const average = sum / itemConfidences.length;
    
    // Apply penalties for low individual scores
    const lowScores = itemConfidences.filter(score => score < 70).length;
    const penalty = lowScores * 5; // 5% penalty per low-confidence item
    
    return Math.max(0, Math.min(100, Math.round(average - penalty)));
  }
  
  module.exports = {
    calculateItemConfidence,
    calculateOverallConfidence
  };