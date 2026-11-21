const express = require('express');
const router = express.Router();

// Triage service routes will be detailed in Phase 3
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Triage service active' });
});

module.exports = router;
