const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  media: [{
    url: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'video', 'audio'], required: true },
    mimeType: { type: String, default: '' },
    originalName: { type: String, default: '' }
  }],
  audioTranscript: {
    type: String,
    default: ''
  },
  citizenNote: {
    type: String,
    default: ''
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
    landmark: { type: String, default: '' },
    district: { type: String, default: 'Haveri' },
    state: { type: String, default: 'Karnataka' }
  },
  issueType: {
    type: String,
    enum: ['pothole', 'water_leak', 'garbage', 'streetlight', 'sewage', 'pollution', 'road_damage', 'other'],
    required: true,
    index: true
  },
  summary: {
    type: String,
    required: true
  },
  summaryLocal: {
    type: String,
    default: ''
  },
  aiAnalysis: {
    visualSeverity: { type: Number, min: 1, max: 5, default: 3 },
    safetyRisk: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    confidence: { type: Number, min: 0, max: 1, default: 0.85 },
    languageDetected: { type: String, enum: ['en', 'kn', 'hi'], default: 'en' },
    needsHumanReview: { type: Boolean, default: false },
    rawModelResponse: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  priorityScore: {
    type: Number,
    min: 0,
    max: 10,
    required: true,
    index: true
  },
  scoreBreakdown: [{
    factor: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    points: { type: Number, required: true },
    reason: { type: String, required: true }
  }],
  department: {
    code: { type: String, required: true },
    name: { type: String, required: true },
    contactEmail: { type: String, default: '' }
  },
  routingReason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['received', 'assigned', 'in_progress', 'resolved', 'rejected'],
    default: 'received',
    index: true
  },
  resolutionPhoto: {
    type: String,
    default: null
  },
  resolutionNote: {
    type: String,
    default: ''
  },
  slaDueAt: {
    type: Date,
    required: true,
    index: true
  },
  isOverdue: {
    type: Boolean,
    default: false,
    index: true
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    default: null
  },
  reportCount: {
    type: Number,
    default: 1
  },
  needsHumanReview: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Virtual calculation for overdue flag check
complaintSchema.methods.checkOverdue = function() {
  if (this.status === 'resolved' || this.status === 'rejected') {
    return false;
  }
  return new Date() > this.slaDueAt;
};

module.exports = mongoose.model('Complaint', complaintSchema);
