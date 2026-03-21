import http from 'http';

async function testRoute(path: string, method: string = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    console.log(`测试: ${method} ${path}`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应: ${data}`);
        console.log('');
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('=== 测试Long Running Agent路由 ===\n');

  try {
    await testRoute('/api/health');
    await testRoute('/api/long-running-agent/projects/test-project-001/status');
    await testRoute('/api/projects/test-project-001/status');
    await testRoute('/api/auth/me');
    
    console.log('\n=== 测试完成 ===');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

main().catch(console.error);
