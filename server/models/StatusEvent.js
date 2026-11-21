const mongoose = require('mongoose');

const statusEventSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['received', 'assigned', 'in_progress', 'resolved', 'rejected'],
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  byUser: {
    name: { type: String, default: 'System' },
    role: { type: String, default: 'system' },
    department: { type: String, default: '' }
  },
  photo: {
    type: String,
    default: null // Before or After resolution photo URL
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StatusEvent', statusEventSchema);
