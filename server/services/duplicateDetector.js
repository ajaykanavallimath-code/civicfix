const Complaint = require('../models/Complaint');
const { calculateDistanceMeters, calculatePriorityScore } = require('./priorityScorer');

/**
 * Detect if a nearby complaint of the same type already exists within 50 meters
 */
async function findDuplicateComplaint({ issueType, location }) {
  // Query unresolved complaints of the same issue type
  const candidates = await Complaint.find({
    issueType,
    status: { $nin: ['resolved', 'rejected'] },
    duplicateOf: null // Only check primary parent complaints
  });

  for (const candidate of candidates) {
    const dist = calculateDistanceMeters(
      location.lat,
      location.lng,
      candidate.location.lat,
      candidate.location.lng
    );

    if (dist <= 50) {
      console.log(`[DuplicateDetector] Found existing parent complaint ${candidate.trackingId} within ${Math.round(dist)}m`);
      return candidate;
    }
  }

  return null;
}

/**
 * Merge new report into existing parent complaint and recompute priority
 */
async function mergeWithParentComplaint(parentComplaint) {
  parentComplaint.reportCount = (parentComplaint.reportCount || 1) + 1;

  // Recompute deterministic priority score with increased report count
  const { priorityScore, scoreBreakdown } = await calculatePriorityScore({
    visualSeverity: parentComplaint.aiAnalysis?.visualSeverity || 3,
    safetyRisk: parentComplaint.aiAnalysis?.safetyRisk || 'medium',
    location: parentComplaint.location,
    duplicateCount: parentComplaint.reportCount,
    createdAt: parentComplaint.createdAt
  });

  parentComplaint.priorityScore = priorityScore;
  parentComplaint.scoreBreakdown = scoreBreakdown;
  await parentComplaint.save();

  return parentComplaint;
}

module.exports = { findDuplicateComplaint, mergeWithParentComplaint };
