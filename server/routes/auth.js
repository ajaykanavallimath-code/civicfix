const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/auth/users - list demo users for quick role switching
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ role: 1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/demo-login - simple demo role login
router.post('/demo-login', async (req, res, next) => {
  try {
    const { email, role, departmentCode } = req.body;
    let user = null;
    if (email) {
      user = await User.findOne({ email });
    } else if (role) {
      const query = { role };
      if (departmentCode) query.departmentCode = departmentCode;
      user = await User.findOne(query);
    }
    
    if (!user) {
      user = await User.findOne({ role: 'officer' }) || {
        name: 'Demo Officer',
        email: 'officer@civicfix.kar.gov.in',
        role: 'officer',
        departmentCode: 'KUWSDB'
      };
    }
    
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
