export function parseCsv(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];
  const first = lines[0].split(',').map(c => c.trim());
  const hasHeader = first.some(h => /email|user|type|name|phone/i.test(h));
  const rows = [];
  for (let i = (hasHeader ? 1 : 0); i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (hasHeader) {
      const obj = {};
      for (let j = 0; j < first.length; j++) {
        obj[first[j]] = cols[j] || '';
      }
      rows.push(obj);
    } else {
      rows.push({ email: cols[0] || '', userType: cols[1] || 'client', full_name: cols[2] || '', phone: cols[3] || '' });
    }
  }
  return rows;
}