const mongoose = require('mongoose');

const sensitivePlaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['school', 'hospital', 'bus_stand', 'market', 'main_road', 'other'],
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  radiusMeters: {
    type: Number,
    default: 200
  },
  priorityBoost: {
    type: Number,
    default: 1.5 // boost added to priority score
  },
  address: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SensitivePlace', sensitivePlaceSchema);
