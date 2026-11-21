const SensitivePlace = require('../models/SensitivePlace');

/**
 * Calculate Haversine distance in meters between two lat/lng pairs
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate explainable priority score (0.0 to 10.0)
 */
async function calculatePriorityScore({
  visualSeverity,
  safetyRisk,
  location,
  duplicateCount = 1,
  createdAt = new Date()
}) {
  const breakdown = [];

  // 1. Visual Severity (35% -> Max 3.5 pts)
  const severityPoints = Number(((visualSeverity / 5) * 3.5).toFixed(1));
  breakdown.push({
    factor: 'Visual Severity (35%)',
    value: `${visualSeverity}/5`,
    points: severityPoints,
    reason: `AI image triage assessed visual damage at Level ${visualSeverity}`
  });

  // 2. Safety Risk (25% -> Max 2.5 pts)
  let safetyPoints = 0.8;
  if (safetyRisk === 'high') safetyPoints = 2.5;
  else if (safetyRisk === 'medium') safetyPoints = 1.5;
  breakdown.push({
    factor: 'Safety Risk (25%)',
    value: safetyRisk,
    points: safetyPoints,
    reason: `${safetyRisk.toUpperCase()} hazard potential to pedestrians and vehicles`
  });

  // 3. Location Sensitivity (15% -> Max 1.5 - 2.0 pts)
  let sensitivePoints = 0.4;
  let sensitiveReason = 'Standard urban road zone';
  let sensitiveValue = 'standard road';

  try {
    const sensitivePlaces = await SensitivePlace.find({});
    let closestPlace = null;
    let minDistance = Infinity;

    for (const place of sensitivePlaces) {
      const dist = calculateDistanceMeters(location.lat, location.lng, place.location.lat, place.location.lng);
      if (dist < minDistance && dist <= (place.radiusMeters || 200)) {
        minDistance = dist;
        closestPlace = place;
      }
    }

    if (closestPlace) {
      sensitivePoints = closestPlace.priorityBoost || 1.5;
      sensitiveValue = closestPlace.category;
      sensitiveReason = `Within ${Math.round(minDistance)}m of ${closestPlace.name} (${closestPlace.category.replace('_', ' ')})`;
    }
  } catch (err) {
    console.warn('[PriorityScorer] Sensitive places lookup note:', err.message);
  }

  breakdown.push({
    factor: 'Location Sensitivity (15%)',
    value: sensitiveValue,
    points: Number(sensitivePoints.toFixed(1)),
    reason: sensitiveReason
  });

  // 4. Duplicate / Community Reports at Same Spot (15% -> Max 1.5 pts)
  const duplicatePoints = Number(Math.min(duplicateCount * 0.3, 1.5).toFixed(1));
  breakdown.push({
    factor: 'Community Reports (15%)',
    value: `${duplicateCount} report${duplicateCount > 1 ? 's' : ''}`,
    points: duplicatePoints,
    reason: `${duplicateCount} community member${duplicateCount > 1 ? 's' : ''} reported issue at this coordinate`
  });

  // 5. Age of Complaint (10% -> Max 1.0 pt, increases daily)
  const hoursOpen = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (3600 * 1000));
  const agePoints = Number(Math.min((hoursOpen / 24) * 0.2, 1.0).toFixed(1));
  breakdown.push({
    factor: 'Age Escalation (10%)',
    value: `${Math.round(hoursOpen)}h open`,
    points: agePoints,
    reason: hoursOpen > 48 ? 'SLA escalation boost applied due to pending resolution' : 'Freshly reported complaint'
  });

  // Calculate sum and clamp between 0.0 and 10.0
  const rawSum = severityPoints + safetyPoints + sensitivePoints + duplicatePoints + agePoints;
  const priorityScore = Number(Math.min(10.0, Math.max(0.0, rawSum)).toFixed(1));

  return {
    priorityScore,
    scoreBreakdown: breakdown
  };
}

module.exports = { calculatePriorityScore, calculateDistanceMeters };
