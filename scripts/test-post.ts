import http from 'http';

async function testPostRequest() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/long-running-agent/projects/test-project/users/test-user/initialize',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    console.log('测试POST请求: /api/long-running-agent/projects/test-project/users/test-user/initialize');

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应: ${data}`);
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', reject);

    req.write(JSON.stringify({
      task_description: '测试任务',
      provider_id: 'openai',
    }));
    req.end();
  });
}

testPostRequest().catch(console.error);
