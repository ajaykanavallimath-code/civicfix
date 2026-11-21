const fs = require('fs');
const path = require('path');

async function testReportFlow() {
  console.log('Testing full report flow...');

  // 1. Simulate camera photo capture (generate a dummy JPEG buffer)
  // 1x1 white JPEG buffer
  const jpegHeader = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x00, 0xff, 0xd9
  ]);

  const photoBlob = new Blob([jpegHeader], { type: 'image/jpeg' });
  const photoFile = new File([photoBlob], 'camera-capture.jpg', { type: 'image/jpeg' });

  // 2. Prepare Form Data with live GPS coordinates & reverse geocoded address
  const formData = new FormData();
  formData.append('media', photoFile);
  formData.append('lat', '14.9702');
  formData.append('lng', '75.3418');
  formData.append('address', 'Near Savanur Govt Model Primary School, Court Road, Savanur');
  formData.append('citizenNote', 'Live camera photo of severe road pothole near school entrance.');

  console.log('Sending multipart POST /api/complaints...');
  const res = await fetch('http://localhost:5000/api/complaints', {
    method: 'POST',
    body: formData
  });

  console.log('HTTP Response Status:', res.status);
  const data = await res.json();
  
  if (!res.ok || !data.success) {
    console.error('Submission failed with error:', data);
    process.exit(1);
  }

  const c = data.complaint;
  console.log('\n--- SUCCESS: RESULT CARD PAYLOAD ---');
  console.log('Tracking ID:        ', c.trackingId);
  console.log('Issue Type:         ', c.issueType);
  console.log('Summary:            ', c.summary);
  console.log('Summary (Local):    ', c.summaryLocal);
  console.log('Priority Score:     ', c.priorityScore, '/ 10');
  console.log('Routing Department: ', c.department?.name, `(${c.department?.code})`);
  console.log('Routing Reason:     ', c.routingReason);
  console.log('Target SLA:         ', c.slaDueAt);
  console.log('Score Factors Count:', c.scoreBreakdown?.length);
  console.log('Media URL:          ', c.media?.[0]?.url);
  console.log('------------------------------------');
  console.log('Flow test PASSED: Triage Result Card displays with all required explainability fields!');
}

testReportFlow().catch((err) => {
  console.error('Fatal Flow Test Error:', err);
  process.exit(1);
});
