const Department = require('../models/Department');

/**
 * Route grievance to accountable Karnataka department based on issueType & location
 */
async function routeGrievance({ issueType, location }) {
  // Find department that handles this issueType
  let dept = await Department.findOne({ handledIssues: issueType });
  
  if (!dept) {
    // Default fallback to Town Municipal Council
    dept = await Department.findOne({ code: 'TMC' }) || {
      code: 'TMC',
      name: 'Town Municipal Council (Savanur)',
      slaHours: 24,
      contactEmail: 'chief-officer@savanurtmc.kar.gov.in'
    };
  }

  // Generate explicit, transparent routing reason
  let reason = '';
  switch (issueType) {
    case 'pothole':
    case 'road_damage':
      reason = `Road surface damage -> PWD Haveri Division for asphalt compaction and vehicular safety maintenance; statutory SLA: ${dept.slaHours} hours.`;
      break;
    case 'water_leak':
      reason = `Drinking water pipeline rupture -> Karnataka Urban Water Supply & Drainage Board (KUWS&DB) under urban water utility mandate; SLA: ${dept.slaHours} hours.`;
      break;
    case 'garbage':
      reason = `Municipal solid waste accumulation -> Savanur Town Municipal Council (TMC) under Karnataka Municipalities Act sanitation duties; SLA: ${dept.slaHours} hours.`;
      break;
    case 'streetlight':
      reason = `Electrical utility fault -> HESCOM (Hubli Electricity Supply Co.) for transformer/feeder pole repair and public safety; SLA: ${dept.slaHours} hours.`;
      break;
    case 'sewage':
      reason = `Drainage / sullage overflow -> Town Municipal Council & Drainage Wing for suction unblocking; SLA: ${dept.slaHours} hours.`;
      break;
    case 'pollution':
      reason = `Environmental contamination / burning -> Karnataka State Pollution Control Board (KSPCB) Regional Officer; SLA: ${dept.slaHours} hours.`;
      break;
    default:
      reason = `Grievance -> ${dept.name} as primary nodal civic authority in Haveri district; SLA: ${dept.slaHours} hours.`;
  }

  const slaDueAt = new Date(Date.now() + dept.slaHours * 3600 * 1000);

  // Mock authority email notification log
  console.log(`[Simulated Email Notification] To: ${dept.contactEmail} | Subject: [CivicFix Alert] New ${issueType.toUpperCase()} ticket routed with SLA ${dept.slaHours}h`);

  return {
    department: {
      code: dept.code,
      name: dept.name,
      contactEmail: dept.contactEmail
    },
    routingReason: reason,
    slaDueAt
  };
}

module.exports = { routeGrievance };
