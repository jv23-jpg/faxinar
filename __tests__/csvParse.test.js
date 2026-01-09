import { parseCsv } from '@/utils/csvParse';

test('parses header CSV', () => {
  const csv = 'email,userType,full_name,phone\nfoo@ex.com,cleaner,Foo,123\nbar@ex.com,client,Bar,456';
  const rows = parseCsv(csv);
  expect(rows.length).toBe(2);
  expect(rows[0].email).toBe('foo@ex.com');
  expect(rows[1].userType).toBe('client');
});

test('parses no-header CSV', () => {
  const csv = 'foo@ex.com,cleaner,Foo,123\nbar@ex.com,client,Bar,456';
  const rows = parseCsv(csv);
  expect(rows.length).toBe(2);
  expect(rows[0].email).toBe('foo@ex.com');
  expect(rows[0].full_name).toBe('Foo');
});