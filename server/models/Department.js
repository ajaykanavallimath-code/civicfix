const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  nameLocal: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  jurisdiction: {
    type: String,
    default: 'Haveri District / Savanur Taluk'
  },
  handledIssues: [{
    type: String,
    enum: ['pothole', 'water_leak', 'garbage', 'streetlight', 'sewage', 'pollution', 'road_damage', 'other']
  }],
  slaHours: {
    type: Number,
    required: true,
    default: 48
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    default: '+91 8378 245001'
  },
  officerName: {
    type: String,
    default: 'Nodal Officer'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
