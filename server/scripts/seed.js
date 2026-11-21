require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Department = require('../models/Department');
const SensitivePlace = require('../models/SensitivePlace');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const StatusEvent = require('../models/StatusEvent');

const departmentsData = require('../data/seedDepartments.json');
const sensitivePlacesData = require('../data/sensitivePlaces.json');

const usersData = [
  {
    name: 'Santosh Kulkarni',
    email: 'aee-savanur@kuwsdb.gov.in',
    role: 'officer',
    departmentCode: 'KUWSDB',
    phone: '+91 8378 246190'
  },
  {
    name: 'Rajeshwari H.',
    email: 'ee-haveri@karnatakapwd.gov.in',
    role: 'officer',
    departmentCode: 'PWD',
    phone: '+91 8375 232415'
  },
  {
    name: 'M. B. Patil',
    email: 'chief-officer@savanurtmc.kar.gov.in',
    role: 'officer',
    departmentCode: 'TMC',
    phone: '+91 8378 245022'
  },
  {
    name: 'Dr. Anand Rao',
    email: 'admin@civicfix.kar.gov.in',
    role: 'admin',
    departmentCode: null,
    phone: '+91 80 22032000'
  },
  {
    name: 'Basavaraj Shivappa',
    email: 'citizen@example.com',
    role: 'citizen',
    departmentCode: null,
    phone: '+91 94481 23456'
  }
];

function generateSeedComplaints(departments) {
  const now = new Date();
  const hoursAgo = (h) => new Date(now.getTime() - h * 3600 * 1000);
  const daysAgo = (d) => new Date(now.getTime() - d * 24 * 3600 * 1000);

  const rawComplaints = [
    // 1. Critical Water Leak near Savanur Hospital - IN PROGRESS
    {
      trackingId: 'CF-2026-000101',
      media: [{ url: '/seed/water-leak-1.svg', fileType: 'image', mimeType: 'image/svg+xml', originalName: 'pipe_burst.svg' }],
      location: { lat: 14.9686, lng: 75.3432, address: 'Near Community Health Centre, Hospital Road, Savanur', landmark: 'CHC Gate 2', district: 'Haveri' },
      issueType: 'water_leak',
      summary: 'Major municipal water pipeline fractured causing gushing drinking water flood on road.',
      summaryLocal: 'ಸಮುದಾಯ ಆರೋಗ್ಯ ಕೇಂದ್ರದ ಬಳಿ ಕುಡಿಯುವ ನೀರಿನ ಮುಖ್ಯ ಪೈಪ್‌ಲೈನ್ ಒಡೆದು ರಸ್ತೆಯುದ್ದಕ್ಕೂ ನೀರು ಪೋಲಾಗುತ್ತಿದೆ.',
      aiAnalysis: { visualSeverity: 5, safetyRisk: 'high', confidence: 0.94, languageDetected: 'kn', needsHumanReview: false },
      priorityScore: 9.3,
      scoreBreakdown: [
        { factor: 'Visual Severity (35%)', value: '5/5', points: 3.5, reason: 'Severe pipe rupture flooding roadway' },
        { factor: 'Safety Risk (25%)', value: 'high', points: 2.5, reason: 'Erosion and slippery asphalt posing risk to ambulances' },
        { factor: 'Sensitive Place (15%)', value: 'hospital', points: 1.8, reason: 'Within 60m of Savanur Community Health Centre' },
        { factor: 'Community Reports (15%)', value: '3 reports', points: 0.9, reason: 'Multiple reports received in the same area' },
        { factor: 'Age Escalation (10%)', value: '18 hours', points: 0.6, reason: 'Unresolved leak running since morning' }
      ],
      departmentCode: 'KUWSDB',
      routingReason: 'Water pipeline burst -> KUWS&DB because urban water distribution infrastructure falls under Karnataka Urban Water Supply jurisdiction; SLA: 48h',
      status: 'in_progress',
      hoursOffset: 18,
      slaHours: 48,
      reportCount: 3
    },

    // 2. Severe Pothole near Govt School Savanur - OVERDUE ESCALATED
    {
      trackingId: 'CF-2026-000102',
      media: [{ url: '/seed/pothole-1.svg', fileType: 'image', mimeType: 'image/svg+xml', originalName: 'school_pothole.svg' }],
      location: { lat: 14.9701, lng: 75.3419, address: 'Opposite Savanur Govt Model Primary School, Court Road', landmark: 'School Main Gate', district: 'Haveri' },
      issueType: 'pothole',
      summary: 'Massive double crater on bus route causing two-wheelers and school vans to swerve dangerously.',
      summaryLocal: 'ಸರಕಾರಿ ಮಾದರಿ ಪ್ರಾಥಮಿಕ ಶಾಲೆಯ ಎದುರು ರಸ್ತೆಯಲ್ಲಿ ಆಳವಾದ ಗುಂಡಿ ಬಿದ್ದಿದ್ದು, ಶಾಲಾ ವಾಹನಗಳಿಗೆ ಅಪಾಯಕಾರಿಯಾಗಿದೆ.',
      aiAnalysis: { visualSeverity: 4, safetyRisk: 'high', confidence: 0.96, languageDetected: 'kn', needsHumanReview: false },
      priorityScore: 8.8,
      scoreBreakdown: [
        { factor: 'Visual Severity (35%)', value: '4/5', points: 2.8, reason: 'Exposed stone base and 15cm crater depth' },
        { factor: 'Safety Risk (25%)', value: 'high', points: 2.5, reason: 'School children crossing and high bus traffic' },
        { factor: 'Sensitive Place (15%)', value: 'school', points: 1.5, reason: 'Directly in front of Savanur Govt Model Primary School' },
        { factor: 'Community Reports (15%)', value: '5 reports', points: 1.2, reason: '5 community reports clustered at this spot' },
        { factor: 'Age Escalation (10%)', value: '4 days', points: 0.8, reason: 'Complaint has exceeded standard resolution threshold' }
      ],
      departmentCode: 'PWD',
      routingReason: 'Road crater on district corridor -> PWD because Court Road connects to State Highway 40 under Haveri PWD division; SLA: 72h',
      status: 'assigned',
      hoursOffset: 96, // 4 days ago -> OVERDUE (SLA 72h)
      slaHours: 72,
      reportCount: 5
    },

    // 3. Overflowing Garbage Dump at Market Yard - RESOLVED
    {
      trackingId: 'CF-2026-000103',
      media: [{ url: '/seed/garbage-1.svg', fileType: 'image', mimeType: 'image/svg+xml', originalName: 'market_waste.svg' }],
      resolutionPhoto: '/seed/resolved-garbage.svg',
      resolutionNote: 'TMC sanitation squad dispatched compactor vehicle; cleared 3.5 tons of organic waste and sprayed bleaching powder.',
      location: { lat: 14.9658, lng: 75.3460, address: 'APMC Market Yard Gate 1, Haveri Road, Savanur', landmark: 'Grain Merchant Yard', district: 'Haveri' },
      issueType: 'garbage',
      summary: 'Rotting vegetable garbage and plastic waste spilling across road blocking market entrance.',
      summaryLocal: 'ಎಪಿಎಂಸಿ ಮಾರ್ಕೆಟ್ ಬಳಿ ರಾಶಿ ಬಿದ್ದಿರುವ ತ್ಯಾಜ್ಯದಿಂದ ದುರ್ವಾಸನೆ ಹರಡುತ್ತಿದ್ದು, ಸಾರ್ವಜನಿಕರಿಗೆ ತೊಂದರೆಯಾಗಿದೆ.',
      aiAnalysis: { visualSeverity: 4, safetyRisk: 'medium', confidence: 0.91, languageDetected: 'en', needsHumanReview: false },
      priorityScore: 7.4,
      scoreBreakdown: [
        { factor: 'Visual Severity (35%)', value: '4/5', points: 2.8, reason: 'Significant waste spillage over 15 meters' },
        { factor: 'Safety Risk (25%)', value: 'medium', points: 1.5, reason: 'Health hazard, stray animal congregation' },
        { factor: 'Sensitive Place (15%)', value: 'market', points: 1.2, reason: 'Within 50m of APMC Grain Market' },
        { factor: 'Community Reports (15%)', value: '2 reports', points: 0.6, reason: '2 merchant complaints logged' },
        { factor: 'Age Escalation (10%)', value: '1.5 days', points: 0.3, reason: 'Cleared within SLA' }
      ],
      departmentCode: 'TMC',
      routingReason: 'Solid waste management -> Town Municipal Council Savanur as per Karnataka Municipalities Act sanitation mandates; SLA: 24h',
      status: 'resolved',
      hoursOffset: 30,
      slaHours: 24,
      resolvedAt: hoursAgo(6),
      reportCount: 2
    },

    // 4. Broken High Voltage Streetlight wire - RECEIVED (CRITICAL)
    {
      trackingId: 'CF-2026-000104',
      media: [{ url: '/seed/streetlight-2.svg', fileType: 'image', mimeType: 'image/svg+xml', originalName: 'sparking_wire.svg' }],
      location: { lat: 14.9696, lng: 75.3391, address: 'KSRTC Bus Stand Exit, Station Road, Savanur', landmark: 'Opposite Auto Stand', district: 'Haveri' },
      issueType: 'streetlight',
      summary: 'Dangling electrical feeder wire from streetlight pole sparking during evening winds.',
      summaryLocal: 'ಬಸ್ ನಿಲ್ದಾಣದ ಬಳಿ ವಿದ್ಯುತ್ ಕಂಬದಿಂದ ವೈರ್ ತುಂಡಾಗಿ ನೇತಾಡುತ್ತಿದ್ದು ಕಿಡಿ ಬರುತ್ತಿದೆ. ತಕ್ಷಣ ದುರಸ್ತಿ ಮಾಡಿ.',
      aiAnalysis: { visualSeverity: 5, safetyRisk: 'high', confidence: 0.98, languageDetected: 'kn', needsHumanReview: false },
      priorityScore: 9.6,
      scoreBreakdown: [
        { factor: 'Visual Severity (35%)', value: '5/5', points: 3.5, reason: 'Direct live electrical wire hazard' },
        { factor: 'Safety Risk (25%)', value: 'high', points: 2.5, reason: 'Imminent electrocution danger to pedestrians' },
        { factor: 'Sensitive Place (15%)', value: 'bus_stand', points: 1.4, reason: 'Heavy commuter footfall outside KSRTC Bus Stand' },
        { factor: 'Community Reports (15%)', value: '4 reports', points: 1.2, reason: '4 emergency alerts registered' },
        { factor: 'Age Escalation (10%)', value: '4 hours', points: 1.0, reason: 'Immediate life safety priority' }
      ],
      departmentCode: 'HESCOM',
      routingReason: 'Sparking electric wire on distribution pole -> HESCOM Savanur sub-division for emergency power cut and rewiring; SLA: 12h',
      status: 'received',
      hoursOffset: 4,
      slaHours: 12,
      reportCount: 4
    },

    // 5. Open Sewage Sullage Line - IN PROGRESS
    {
      trackingId: 'CF-2026-000105',
      media: [{ url: '/seed/sewage-1.svg', fileType: 'image', mimeType: 'image/svg+xml', originalName: 'sewage_overflow.svg' }],
      location: { lat: 14.9672, lng: 75.3441, address: 'Ward 6, Muslim Galli Cross, Savanur', landmark: 'Near Jamia Masjid', district: 'Haveri' },
      issueType: 'sewage',
      summary: 'Underground drainage blockage overflowing foul sullage across narrow residential street.',
      summaryLocal: 'ಒಳಚರಂಡಿ ಕಟ್ಟಿಕೊಂಡು ಕೊಳಚೆ ನೀರು ರಸ್ತೆಯಲ್ಲಿ ಹರಿಯುತ್ತಿದ್ದು ಸೊಳ್ಳೆಗಳ ಕಾಟ ಹೆಚ್ಚಾಗಿದೆ.',
      aiAnalysis: { visualSeverity: 4, safetyRisk: 'medium', confidence: 0.89, languageDetected: 'kn', needsHumanReview: false },
      priorityScore: 7.8,
      scoreBreakdown: [
        { factor: 'Visual Severity (35%)', value: '4/5', points: 2.8, reason: 'Extensive blackwater contamination' },
        { factor: 'Safety Risk (25%)', value: 'medium', points: 1.5, reason: 'Vector-borne disease vector in dense residential lane' },
        { factor: 'Sensitive Place (15%)', value: 'residential', points: 0.8, reason: 'Direct residential pathway' },
        { factor: 'Community Reports (15%)', value: '3 reports', points: 0.9, reason: '3 household complaints linked' },
        { factor: 'Age Escalation (10%)', value: '26 hours', points: 0.8, reason: 'Exceeded 24h municipal drainage SLA' }
      ],
      departmentCode: 'TMC',
      routingReason: 'Town drainage maintenance -> Savanur Town Municipal Council under public health & sanitation duties; SLA: 24h',
      status: 'in_progress',
      hoursOffset: 26,
      slaHours: 24,
      reportCount: 3
    },

    // 6. Deep Pothole on Haveri PB Road - RESOLVED
    {
      trackingId: 'CF-2026-000106',
      media: [{ url: '/seed/pothole-2.svg', fileType: 'image', mimeType: 'image/svg+xml', originalName: 'pb_road_crater.svg' }],
      resolutionPhoto: '/seed/resolved-pothole.svg',
      resolutionNote: 'PWD Haveri emergency patch crew filled with bituminous cold mix and roller compacted.',
      location: { lat: 14.7942, lng: 75.4002, address: 'Old PB Road near Haveri District Hospital', landmark: 'Shivaji Circle', district: 'Haveri' },
      issueType: 'pothole',
      summary: 'Sharp trench across vehicular lane damaging wheel rims and threatening ambulances.',
      summaryLocal: 'ಹಾವೇರಿ ಜಿಲ್ಲಾ ಆಸ್ಪತ್ರೆ ಹತ್ತಿರ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಹಳ್ಳ ಬಿದ್ದಿದೆ.',
      aiAnalysis: { visualSeverity: 4, safetyRisk: 'high', confidence: 0.93, languageDetected: 'en', needsHumanReview: false },
      priorityScore: 8.5,
      scoreBreakdown: [
        { factor: 'Visual Severity (35%)', value: '4/5', points: 2.8, reason: 'Deep transverse road fracture' },
        { factor: 'Safety Risk (25%)', value: 'high', points: 2.5, reason: 'Emergency medical corridor risk' },
        { factor: 'Sensitive Place (15%)', value: 'hospital', points: 2.0, reason: 'Within 150m of Haveri District General Hospital' },
        { factor: 'Community Reports (15%)', value: '2 reports', points: 0.6, reason: '2 citizen alerts' },
        { factor: 'Age Escalation (10%)', value: '2 days', points: 0.6, reason: 'Resolved within 48h' }
      ],
      departmentCode: 'PWD',
      routingReason: 'Major urban arterial damage -> PWD Haveri Division for highway pavement preservation; SLA: 72h',
      status: 'resolved',
      hoursOffset: 48,
      slaHours: 72,
      resolvedAt: hoursAgo(12),
      reportCount: 2
    },

    // 7. Industrial Effluent in Tarihal Hubballi - OVERDUE
    {
      trackingId: 'CF-2026-000107',
      media: [{ url: '/seed/pollution-1.svg', fileType: 'image', mimeType: 'image/svg+xml', originalName: 'effluent_stream.svg' }],
      location: { lat: 15.3620, lng: 75.1180, address: 'Plot 44, Tarihal Industrial Area, Hubballi', landmark: 'Near Unkal Nala culvert', district: 'Dharwad' },
      issueType: 'pollution',
      summary: 'Untreated chemical runoff with intense chemical stench draining into natural storm canal.',
      summaryLocal: 'ತಾರಿಹಾಳ ಕೈಗಾರಿಕಾ ಪ್ರದೇಶದಲ್ಲಿ ರಾಸಾಯನಿಕ ತ್ಯಾಜ್ಯ ನೀರನ್ನು ಚರಂಡಿಗೆ ಬಿಡಲಾಗುತ್ತಿದೆ.',
      aiAnalysis: { visualSeverity: 5, safetyRisk: 'high', confidence: 0.95, languageDetected: 'kn', needsHumanReview: false },
      priorityScore: 8.9,
      scoreBreakdown: [
        { factor: 'Visual Severity (35%)', value: '5/5', points: 3.5, reason: 'Discolored foaming chemical discharge' },
        { factor: 'Safety Risk (25%)', value: 'high', points: 2.5, reason: 'Environmental contamination into Unkal water catchment' },
        { factor: 'Sensitive Place (15%)', value: 'water_body', points: 1.5, reason: 'Adjacent to agricultural irrigation stream' },
        { factor: 'Community Reports (15%)', value: '3 reports', points: 0.9, reason: 'Local residents association complaint' },
        { factor: 'Age Escalation (10%)', value: '6 days', points: 0.5, reason: 'Overdue investigation pending field sample' }
      ],
      departmentCode: 'KSPCB',
      routingReason: 'Industrial environmental hazard -> Karnataka State Pollution Control Board Regional Office; SLA: 48h',
      status: 'assigned',
      hoursOffset: 140, // ~6 days -> OVERDUE (SLA 48h)
      slaHours: 48,
      reportCount: 3
    },

    // 8. Broken Streetlight outside KIMS Hubballi - ASSIGNED
    {
      trackingId: 'CF-2026-000108',
      media: [{ url: '/seed/streetlight-1.svg', fileType: 'image', mimeType: 'image/svg+xml', originalName: 'dark_junction.svg' }],
      location: { lat: 15.3715, lng: 75.1302, address: 'Vidyanagar Road, Outside KIMS Gate 3, Hubballi', landmark: 'KIMS Main Gate', district: 'Dharwad' },
      issueType: 'streetlight',
      summary: 'Four sequential streetlights completely blacked out creating pitch darkness for pedestrians at night.',
      summaryLocal: 'ಕಿಮ್ಸ್ ಆಸ್ಪತ್ರೆ ಗೇಟ್ ಬಳಿ ಬೀದಿ ದೀಪಗಳು ಕೆಟ್ಟಿದ್ದು ರಾತ್ರಿ ವೇಳೆ ಕತ್ತಲೆಯಾಗಿದೆ.',
      aiAnalysis: { visualSeverity: 3, safetyRisk: 'medium', confidence: 0.92, languageDetected: 'hi', needsHumanReview: false },
      priorityScore: 7.2,
      scoreBreakdown: [
        { factor: 'Visual Severity (35%)', value: '3/5', points: 2.1, reason: 'Fixture burnout across multiple spans' },
        { factor: 'Safety Risk (25%)', value: 'medium', points: 1.5, reason: 'Women and elderly patient safety risk after dark' },
        { factor: 'Sensitive Place (15%)', value: 'hospital', points: 2.0, reason: 'Directly adjoining KIMS Tertiary Hospital' },
        { factor: 'Community Reports (15%)', value: '2 reports', points: 0.6, reason: '2 citizen entries' },
        { factor: 'Age Escalation (10%)', value: '10 hours', points: 1.0, reason: 'Within SLA inspection cycle' }
      ],
      departmentCode: 'HESCOM',
      routingReason: 'Major corridor lighting failure -> HESCOM Urban Division for transformer line check and LED replacement; SLA: 12h',
      status: 'assigned',
      hoursOffset: 10,
      slaHours: 12,
      reportCount: 2
    },

    // 9. Road Edge Erosion SH-40 Haveri-Savanur - IN PROGRESS
    {
      trackingId: 'CF-2026-000109',
      media: [{ url: '/seed/road-damage-1.svg', fileType: 'image', mimeType: 'image/svg+xml', originalName: 'road_shoulder.svg' }],
      location: { lat: 14.8850, lng: 75.3670, address: 'SH-40 Km 18, Between Savanur and Devihosur', landmark: 'Near Toll Point', district: 'Haveri' },
      issueType: 'road_damage',
      summary: 'Heavy shoulder collapse and asphalt chipping threatening heavy vehicles.',
      summaryLocal: 'ಸವಣೂರು-ಹಾವೇರಿ ರಾಜ್ಯ ಹೆದ್ದಾರಿಯ ಬದಿಯ ರಸ್ತೆ ಕುಸಿದಿದೆ.',
      aiAnalysis: { visualSeverity: 4, safetyRisk: 'high', confidence: 0.88, languageDetected: 'kn', needsHumanReview: false },
      priorityScore: 7.9,
      scoreBreakdown: [
        { factor: 'Visual Severity (35%)', value: '4/5', points: 2.8, reason: 'Deep lateral sub-base degradation' },
        { factor: 'Safety Risk (25%)', value: 'high', points: 2.5, reason: 'Rollover hazard for freight lorries' },
        { factor: 'Sensitive Place (15%)', value: 'highway', points: 1.2, reason: 'High-speed state highway corridor' },
        { factor: 'Community Reports (15%)', value: '1 report', points: 0.3, reason: 'Single detailed driver report' },
        { factor: 'Age Escalation (10%)', value: '30 hours', points: 1.1, reason: 'Priority highway maintenance' }
      ],
      departmentCode: 'PWD',
      routingReason: 'State Highway infrastructure damage -> PWD Haveri Division for stone masonry shoulder reinforcement; SLA: 72h',
      status: 'in_progress',
      hoursOffset: 30,
      slaHours: 72,
      reportCount: 1
    },

    // 10. Pipe Leaks in Ward 3 Haveri - RESOLVED
    {
      trackingId: 'CF-2026-000110',
      media: [{ url: '/seed/water-leak-2.svg', fileType: 'image', mimeType: 'image/svg+xml', originalName: 'ward3_leak.svg' }],
      resolutionPhoto: '/seed/resolved-water.svg',
      resolutionNote: 'Underground connection valve gland replaced and re-pressurized successfully.',
      location: { lat: 14.7960, lng: 75.3980, address: 'Ward 3, Near Tarun Bharat Office, Haveri', landmark: 'PB Road Cross', district: 'Haveri' },
      issueType: 'water_leak',
      summary: 'Water pipe joint separation flooding residential footpath.',
      summaryLocal: 'ವಾರ್ಡ್ 3 ರಲ್ಲಿ ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್ ಲೀಕ್ ಆಗಿ ರಸ್ತೆಯಲ್ಲಿ ನೀರು ವ್ಯರ್ಥವಾಗುತ್ತಿದೆ.',
      aiAnalysis: { visualSeverity: 3, safetyRisk: 'low', confidence: 0.92, languageDetected: 'kn', needsHumanReview: false },
      priorityScore: 5.6,
      scoreBreakdown: [
        { factor: 'Visual Severity (35%)', value: '3/5', points: 2.1, reason: 'Continuous pressurized ground seepage' },
        { factor: 'Safety Risk (25%)', value: 'low', points: 0.8, reason: 'Footpath inundation, no vehicular risk' },
        { factor: 'Sensitive Place (15%)', value: 'residential', points: 0.8, reason: 'Neighborhood access' },
        { factor: 'Community Reports (15%)', value: '1 report', points: 0.3, reason: 'Single resident report' },
        { factor: 'Age Escalation (10%)', value: '1 day', points: 1.6, reason: 'Prompt fix' }
      ],
      departmentCode: 'KUWSDB',
      routingReason: 'Urban residential water supply pipeline -> KUWS&DB Haveri Operations; SLA: 48h',
      status: 'resolved',
      hoursOffset: 36,
      slaHours: 48,
      resolvedAt: hoursAgo(10),
      reportCount: 1
    }
  ];

  // Generate 18 additional realistic complaints spread around Savanur, Haveri & Hubballi
  const additionalTemplates = [
    { type: 'pothole', dept: 'PWD', title: 'Deep Pothole near Hubballi Railway Station', lat: 15.3480, lng: 75.1430, sev: 4, risk: 'high', hours: 40, status: 'in_progress', count: 4, sla: 72 },
    { type: 'garbage', dept: 'TMC', title: 'Overflowing Municipal Bin near Savanur Police Station', lat: 14.9710, lng: 75.3400, sev: 3, risk: 'medium', hours: 14, status: 'received', count: 2, sla: 24 },
    { type: 'streetlight', dept: 'HESCOM', title: 'Flickering Streetlight on Savanur Main Bazaar', lat: 14.9690, lng: 75.3420, sev: 2, risk: 'low', hours: 8, status: 'assigned', count: 1, sla: 12 },
    { type: 'water_leak', dept: 'KUWSDB', title: 'Pipeline Leak near Haveri Railway Station Road', lat: 14.7985, lng: 75.3970, sev: 4, risk: 'medium', hours: 55, status: 'assigned', count: 3, sla: 48 }, // OVERDUE
    { type: 'sewage', dept: 'TMC', title: 'Blocked Stormwater Drain near Savanur Taluk Office', lat: 14.9720, lng: 75.3375, sev: 4, risk: 'medium', hours: 22, status: 'in_progress', count: 2, sla: 24 },
    { type: 'road_damage', dept: 'PWD', title: 'Broken Culvert Slab on Savanur Rural Bypass', lat: 14.9630, lng: 75.3500, sev: 5, risk: 'high', hours: 80, status: 'assigned', count: 3, sla: 72 }, // OVERDUE
    { type: 'garbage', dept: 'TMC', title: 'Waste Accumulated at CBT Bus Stand Hubballi', lat: 15.3520, lng: 75.1380, sev: 3, risk: 'medium', hours: 12, status: 'resolved', count: 2, sla: 24 },
    { type: 'pollution', dept: 'KSPCB', title: 'Illegal Plastic Burning near Savanur APMC Boundary', lat: 14.9645, lng: 75.3470, sev: 4, risk: 'medium', hours: 20, status: 'received', count: 2, sla: 48 },
    { type: 'streetlight', dept: 'HESCOM', title: 'Pole Cable Sparking near Vidyavahini College', lat: 14.9675, lng: 75.3450, sev: 5, risk: 'high', hours: 5, status: 'in_progress', count: 4, sla: 12 },
    { type: 'pothole', dept: 'PWD', title: 'Series of Road Craters on Haveri Ring Road', lat: 14.8020, lng: 75.3900, sev: 3, risk: 'medium', hours: 28, status: 'assigned', count: 1, sla: 72 },
    { type: 'water_leak', dept: 'KUWSDB', title: 'Major Valve Leak at Savanur Water Overhead Tank', lat: 14.9740, lng: 75.3360, sev: 4, risk: 'medium', hours: 16, status: 'in_progress', count: 2, sla: 48 },
    { type: 'garbage', dept: 'TMC', title: 'Construction Debris Dumped on Footpath', lat: 14.7950, lng: 75.4020, sev: 2, risk: 'low', hours: 18, status: 'resolved', count: 1, sla: 24 },
    { type: 'pothole', dept: 'PWD', title: 'Bridge Approach Settlement near Savanur Stream', lat: 14.9610, lng: 75.3350, sev: 4, risk: 'high', hours: 45, status: 'in_progress', count: 2, sla: 72 },
    { type: 'streetlight', dept: 'HESCOM', title: 'Dark Stretch on Haveri Engineering College Road', lat: 14.7890, lng: 75.4050, sev: 3, risk: 'medium', hours: 9, status: 'received', count: 1, sla: 12 },
    { type: 'sewage', dept: 'TMC', title: 'Sullage Backflow near Savanur Court Complex', lat: 14.9705, lng: 75.3412, sev: 3, risk: 'medium', hours: 19, status: 'resolved', count: 2, sla: 24 },
    { type: 'water_leak', dept: 'KUWSDB', title: 'Commercial Connection Pipe Burst, Hubballi Market', lat: 15.3505, lng: 75.1400, sev: 4, risk: 'medium', hours: 24, status: 'resolved', count: 3, sla: 48 },
    { type: 'road_damage', dept: 'PWD', title: 'Asphalt Pavement Cracking on Haveri PB Road', lat: 14.7970, lng: 75.3960, sev: 3, risk: 'medium', hours: 35, status: 'assigned', count: 1, sla: 72 },
    { type: 'pothole', dept: 'PWD', title: 'Dangerous Pothole at Hubballi Chennamma Circle', lat: 15.3530, lng: 75.1375, sev: 4, risk: 'high', hours: 15, status: 'in_progress', count: 5, sla: 72 }
  ];

  additionalTemplates.forEach((item, index) => {
    const idNum = 111 + index;
    const trackingId = `CF-2026-000${idNum}`;
    const isResolved = item.status === 'resolved';
    const mediaImg = item.type === 'pothole' ? '/seed/pothole-1.svg'
      : item.type === 'water_leak' ? '/seed/water-leak-1.svg'
      : item.type === 'garbage' ? '/seed/garbage-1.svg'
      : item.type === 'streetlight' ? '/seed/streetlight-1.svg'
      : item.type === 'sewage' ? '/seed/sewage-1.svg'
      : item.type === 'pollution' ? '/seed/pollution-1.svg'
      : '/seed/road-damage-1.svg';

    const resolutionPhoto = isResolved ? (
      item.type === 'pothole' ? '/seed/resolved-pothole.svg'
      : item.type === 'water_leak' ? '/seed/resolved-water.svg'
      : '/seed/resolved-garbage.svg'
    ) : null;

    // Deterministic priority calculation approximation for seed
    const baseSev = (item.sev / 5) * 3.5;
    const baseRisk = item.risk === 'high' ? 2.5 : item.risk === 'medium' ? 1.5 : 0.8;
    const sensPts = 1.2;
    const dupPts = Math.min(item.count * 0.3, 1.5);
    const agePts = Math.min((item.hours / 24) * 0.2, 1.0);
    const priorityScore = Math.min(Number((baseSev + baseRisk + sensPts + dupPts + agePts).toFixed(1)), 10.0);

    rawComplaints.push({
      trackingId,
      media: [{ url: mediaImg, fileType: 'image', mimeType: 'image/svg+xml', originalName: `${item.type}.svg` }],
      resolutionPhoto,
      resolutionNote: isResolved ? 'Field team inspected and verified work according to department standard operating procedure.' : '',
      location: {
        lat: item.lat,
        lng: item.lng,
        address: `${item.title}, Savanur / Haveri Region`,
        landmark: 'Main Road',
        district: 'Haveri'
      },
      issueType: item.type,
      summary: item.title,
      summaryLocal: `ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆ: ${item.title} - ಸಂಬಂಧಿಸಿದ ಇಲಾಖೆಗೆ ರವಾನಿಸಲಾಗಿದೆ.`,
      aiAnalysis: {
        visualSeverity: item.sev,
        safetyRisk: item.risk,
        confidence: 0.90 + (index % 8) * 0.01,
        languageDetected: index % 2 === 0 ? 'kn' : 'en',
        needsHumanReview: false
      },
      priorityScore,
      scoreBreakdown: [
        { factor: 'Visual Severity (35%)', value: `${item.sev}/5`, points: Number(baseSev.toFixed(1)), reason: `Assessed severity level ${item.sev}` },
        { factor: 'Safety Risk (25%)', value: item.risk, points: baseRisk, reason: `${item.risk.toUpperCase()} safety risk determined from image context` },
        { factor: 'Location Sensitivity (15%)', value: 'civic corridor', points: sensPts, reason: 'Proximity to public transport / civic amenity' },
        { factor: 'Community Reports (15%)', value: `${item.count} reports`, points: Number(dupPts.toFixed(1)), reason: `${item.count} citizen complaints grouped at this location` },
        { factor: 'Age Escalation (10%)', value: `${item.hours}h`, points: Number(agePts.toFixed(1)), reason: `Complaint logged ${item.hours} hours ago` }
      ],
      departmentCode: item.dept,
      routingReason: `Routed to ${item.dept} based on jurisdiction for ${item.type}; SLA: ${item.sla}h`,
      status: item.status,
      hoursOffset: item.hours,
      slaHours: item.sla,
      resolvedAt: isResolved ? hoursAgo(Math.floor(item.hours / 2)) : null,
      reportCount: item.count
    });
  });

  return rawComplaints.map(c => {
    const createdAt = hoursAgo(c.hoursOffset);
    const slaDueAt = new Date(createdAt.getTime() + c.slaHours * 3600 * 1000);
    const isOverdue = (c.status !== 'resolved' && c.status !== 'rejected') && (now > slaDueAt);
    const deptObj = departments.find(d => d.code === c.departmentCode) || departments[0];

    return {
      trackingId: c.trackingId,
      media: c.media,
      resolutionPhoto: c.resolutionPhoto,
      resolutionNote: c.resolutionNote,
      citizenNote: 'Reported by local resident via CivicFix app.',
      location: c.location,
      issueType: c.issueType,
      summary: c.summary,
      summaryLocal: c.summaryLocal,
      aiAnalysis: c.aiAnalysis,
      priorityScore: c.priorityScore,
      scoreBreakdown: c.scoreBreakdown,
      department: {
        code: deptObj.code,
        name: deptObj.name,
        contactEmail: deptObj.contactEmail
      },
      routingReason: c.routingReason,
      status: c.status,
      slaDueAt,
      isOverdue,
      reportCount: c.reportCount || 1,
      needsHumanReview: false,
      createdAt,
      resolvedAt: c.resolvedAt || null
    };
  });
}

async function seed() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.trim()) {
    console.error('\n' + '='.repeat(68));
    console.error('❌ SEED ERROR: MONGODB_URI is missing in server/.env');
    console.error('Please configure MONGODB_URI before running seed.');
    console.error('='.repeat(68) + '\n');
    process.exit(1);
  }

  console.log('[Seed] Starting CivicFix database seeding...');
  await connectDB();

  // 1. Clear existing collections
  await Promise.all([
    Department.deleteMany({}),
    SensitivePlace.deleteMany({}),
    User.deleteMany({}),
    Complaint.deleteMany({}),
    StatusEvent.deleteMany({})
  ]);
  console.log('[Seed] Cleared existing data.');

  // 2. Insert Departments
  const seededDepartments = await Department.insertMany(departmentsData);
  console.log(`[Seed] Seeded ${seededDepartments.length} departments (TMC, PWD, KUWS&DB, HESCOM, KSPCB).`);

  // 3. Insert Sensitive Places
  const seededPlaces = await SensitivePlace.insertMany(sensitivePlacesData);
  console.log(`[Seed] Seeded ${seededPlaces.length} sensitive places (schools, hospitals, bus stands in Haveri/Savanur).`);

  // 4. Insert Users
  const seededUsers = await User.insertMany(usersData);
  console.log(`[Seed] Seeded ${seededUsers.length} users (officers & demo citizen/admin).`);

  // 5. Generate & Insert Complaints
  const complaintsToInsert = generateSeedComplaints(seededDepartments);
  const seededComplaints = await Complaint.insertMany(complaintsToInsert);
  console.log(`[Seed] Seeded ${seededComplaints.length} complaints across Savanur, Haveri & Hubballi.`);

  // 6. Generate StatusEvents for each complaint to populate timeline audit log
  const statusEvents = [];
  for (const comp of seededComplaints) {
    // Initial received event
    statusEvents.push({
      complaintId: comp._id,
      status: 'received',
      note: 'Complaint registered by citizen and triaged by CivicFix AI.',
      byUser: { name: 'CivicFix AI System', role: 'system', department: 'Triage Engine' },
      timestamp: comp.createdAt
    });

    if (comp.status === 'assigned' || comp.status === 'in_progress' || comp.status === 'resolved') {
      const assignedTime = new Date(comp.createdAt.getTime() + 2 * 3600 * 1000);
      statusEvents.push({
        complaintId: comp._id,
        status: 'assigned',
        note: `Dispatched to ${comp.department.name}. Work ticket assigned to nodal officer.`,
        byUser: { name: 'System Router', role: 'system', department: comp.department.code },
        timestamp: assignedTime
      });
    }

    if (comp.status === 'in_progress' || comp.status === 'resolved') {
      const progressTime = new Date(comp.createdAt.getTime() + 6 * 3600 * 1000);
      statusEvents.push({
        complaintId: comp._id,
        status: 'in_progress',
        note: 'Field crew arrived on site. Repair machinery mobilized.',
        byUser: { name: comp.department.name + ' Field Officer', role: 'officer', department: comp.department.code },
        timestamp: progressTime
      });
    }

    if (comp.status === 'resolved') {
      statusEvents.push({
        complaintId: comp._id,
        status: 'resolved',
        note: comp.resolutionNote || 'Remediation completed and verified with on-site inspection.',
        photo: comp.resolutionPhoto,
        byUser: { name: comp.department.name + ' Senior Inspector', role: 'officer', department: comp.department.code },
        timestamp: comp.resolvedAt || new Date()
      });
    }
  }

  await StatusEvent.insertMany(statusEvents);
  console.log(`[Seed] Seeded ${statusEvents.length} status audit timeline events.`);

  console.log('[Seed] Database seeding completed successfully! Dashboard is ready with rich live data.');
  
  if (process.env.RUN_STANDALONE === 'true') {
    process.exit(0);
  }
}

// Allow standalone execution: RUN_STANDALONE=true node scripts/seed.js
if (require.main === module) {
  process.env.RUN_STANDALONE = 'true';
  seed().catch(err => {
    console.error('[Seed Error]:', err);
    process.exit(1);
  });
}

module.exports = { seed };
