async function testStatus() {
  const getRes = await fetch('http://localhost:5000/api/complaints/CF-2026-000101');
  const getData = await getRes.json();
  const id = getData.complaint._id;

  const patchRes = await fetch(`http://localhost:5000/api/complaints/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'resolved',
      note: 'Field crew replaced ductile iron collar joint and restored normal water distribution pressure.',
      officerName: 'Er. Santosh Kulkarni',
      officerRole: 'officer',
      department: 'KUWSDB',
      resolutionPhoto: '/seed/resolved-water.svg'
    })
  });

  const patchData = await patchRes.json();
  console.log('Status updated:', patchData.complaint?.status);
  console.log('Resolved At:', patchData.complaint?.resolvedAt);
  console.log('Resolution Note:', patchData.complaint?.resolutionNote);
  console.log('Event created:', patchData.event?.note);
}

testStatus().catch(console.error);
