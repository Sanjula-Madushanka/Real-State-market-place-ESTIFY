import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route to handle valuation requests
router.post('/', async (req, res) => {
  try {
    console.log("🔹 Incoming Data:", req.body); // Debug Log

    const flaskResponse = await axios.post('http://localhost:5000/predict', req.body);
    
    console.log("✅ Flask Response:", flaskResponse.data); // Debug Log

    res.json({
      success: true,
      predicted_price: flaskResponse.data.predicted_price
    });
  } catch (error) {
    console.error("❌ Valuation Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Valuation failed',
      details: error.response?.data || error.message
    });
  }
});

export default router;
