const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// GET /api/departments - list all departments
router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.find({}).sort({ code: 1 });
    res.json({ success: true, count: departments.length, departments });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
