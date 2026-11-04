import fs from 'node:fs';
for (const path of ['src/pages/flowcharts/FlowchartDashboard.tsx','src/pages/pfmea/PFMEADashboard.tsx']) {
  let s = fs.readFileSync(path,'utf8');
  s = s.replace(/      \/\/ If the toggle is active[^\n]*\n/, '').replace(/      if \(showArchived && isArchived\) \{\s*matchesStatus = true;\s*\}/, '');
  s = s.replace('let matchesStatus =', 'const matchesStatus =');
  s = s.replace('onChange={setSelectedStatuses}', "onChange={values => { setSelectedStatuses(values); if (values.some(value => value.toLowerCase() === 'archived')) setShowArchived(true); }}");
  if (path.includes('PFMEA')) s = s.replace('if (fc.status) statuses.add(fc.status);', 'if (fc.moc_status || fc.status) statuses.add(fc.moc_status || fc.status);').replace('fc.customer.toLowerCase()', "(fc.customer || '').toLowerCase()");
  fs.writeFileSync(path,s);
}
