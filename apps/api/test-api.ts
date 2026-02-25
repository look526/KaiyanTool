async function test() {
  const res = await fetch('http://localhost:3001/api/analytics/user', {
    headers: {
      'Cookie': 'sessionId=63f861c9b361d20bedb9465da95f04cd7d85c53f42f44e9fcea55c74cda6ceae'
    }
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}
test();
