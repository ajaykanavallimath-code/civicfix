async function testSubmit() {
  const formData = new FormData();
  formData.append('lat', '14.9702');
  formData.append('lng', '75.3418');
  formData.append('address', 'Near Savanur Govt Model Primary School, Court Road');
  formData.append('citizenNote', 'Dangerous deep road crater right outside the school gate. School vans getting stuck.');

  const res = await fetch('http://localhost:5000/api/complaints', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  console.log('Result status:', res.status);
  console.log('Tracking ID:', data.complaint?.trackingId);
  console.log('Issue Type:', data.complaint?.issueType);
  console.log('Priority Score:', data.complaint?.priorityScore);
  console.log('Score Breakdown:', JSON.stringify(data.complaint?.scoreBreakdown, null, 2));
  console.log('Routing Department:', data.complaint?.department);
  console.log('Routing Reason:', data.complaint?.routingReason);
  console.log('SLA Due At:', data.complaint?.slaDueAt);
  console.log('Report Count (Duplicate Tracking):', data.complaint?.reportCount);
}

testSubmit().catch(console.error);
