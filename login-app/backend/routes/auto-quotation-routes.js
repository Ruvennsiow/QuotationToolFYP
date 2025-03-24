const express = require('express');
const router = express.Router();
const pool = require('../db');
const { emailCustomer } = require('../services/email-service');

// Get all auto-generated quotations
router.get('/api/auto-quotations', async (req, res) => {
  try {
    const [quotations] = await pool.query(
      `SELECT * FROM quotations 
       WHERE auto_generated = TRUE 
       ORDER BY created_at DESC`
    );
    
    res.json({
      success: true,
      quotations
    });
  } catch (error) {
    console.error('Error fetching auto-quotations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching auto-quotations',
      error: error.message
    });
  }
});

// Get auto-quotation details
router.get('/api/auto-quotations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get quotation
    const [quotations] = await pool.query(
      'SELECT * FROM quotations WHERE id = ? AND auto_generated = TRUE',
      [id]
    );
    
    if (quotations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Auto-quotation not found'
      });
    }
    
    // Get quotation items
    const [items] = await pool.query(
      'SELECT * FROM quotation_items WHERE quotation_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      quotation: quotations[0],
      items
    });
  } catch (error) {
    console.error('Error fetching auto-quotation details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching auto-quotation details',
      error: error.message
    });
  }
});

// Send quotation email
router.post('/api/auto-quotations/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get quotation
    const [quotations] = await pool.query(
      'SELECT * FROM quotations WHERE id = ?',
      [id]
    );
    
    if (quotations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }
    
    // Send email
    const result = await emailCustomer(quotations[0]);
    
    res.json({
      success: true,
      message: 'Quotation email sent successfully',
      result
    });
  } catch (error) {
    console.error('Error sending quotation email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending quotation email',
      error: error.message
    });
  }
});

// Update auto-quotation
router.put('/api/auto-quotations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Update quotation
    await pool.query(
      'UPDATE quotations SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    
    res.json({
      success: true,
      message: 'Auto-quotation updated successfully'
    });
  } catch (error) {
    console.error('Error updating auto-quotation:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating auto-quotation',
      error: error.message
    });
  }
});

// Get auto-quotation statistics
router.get('/api/auto-quotations/stats/summary', async (req, res) => {
  try {
    // Get total count
    const [totalResult] = await pool.query(
      'SELECT COUNT(*) as total FROM quotations WHERE auto_generated = TRUE'
    );
    
    // Get count by status
    const [statusResult] = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM quotations 
       WHERE auto_generated = TRUE 
       GROUP BY status`
    );
    
    // Get average confidence score
    const [confidenceResult] = await pool.query(
      `SELECT AVG(confidence_score) as average_confidence 
       FROM quotations 
       WHERE auto_generated = TRUE`
    );
    
    // Get count by confidence range
    const [confidenceRangeResult] = await pool.query(
      `SELECT 
         SUM(CASE WHEN confidence_score >= 80 THEN 1 ELSE 0 END) as high_confidence,
         SUM(CASE WHEN confidence_score >= 60 AND confidence_score < 80 THEN 1 ELSE 0 END) as medium_confidence,
         SUM(CASE WHEN confidence_score < 60 THEN 1 ELSE 0 END) as low_confidence
       FROM quotations 
       WHERE auto_generated = TRUE`
    );
    
    res.json({
      success: true,
      stats: {
        total: totalResult[0].total,
        byStatus: statusResult,
        averageConfidence: confidenceResult[0].average_confidence || 0,
        byConfidenceRange: confidenceRangeResult[0]
      }
    });
  } catch (error) {
    console.error('Error fetching auto-quotation statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching auto-quotation statistics',
      error: error.message
    });
  }
});

// Get recent auto-quotations (for dashboard)
router.get('/api/auto-quotations/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const [quotations] = await pool.query(
      `SELECT id, company_name, status, confidence_score, created_at 
       FROM quotations 
       WHERE auto_generated = TRUE 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [limit]
    );
    
    res.json({
      success: true,
      quotations
    });
  } catch (error) {
    console.error('Error fetching recent auto-quotations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent auto-quotations',
      error: error.message
    });
  }
});

module.exports = router;