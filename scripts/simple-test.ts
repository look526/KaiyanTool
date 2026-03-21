import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/long-running-agent/projects/test-project/users/test-user/initialize',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应: ${data}`);
  });
});

req.on('error', console.error);

req.write(JSON.stringify({
  task_description: 'test',
  provider_id: '00000000-0000-0000-0000-000000000002',
}));

req.end();
