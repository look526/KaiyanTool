const axios = require('axios');

async function testCsrfFix() {
  try {
    const baseUrl = 'http://localhost:3001/api';
    let cookies = '';
    
    const client = axios.create({
      baseURL: baseUrl,
      withCredentials: true,
      headers: {
        'Cookie': cookies
      }
    });
    
    // 拦截响应，保存cookie
    client.interceptors.response.use(response => {
      if (response.headers['set-cookie']) {
        cookies = response.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
        client.defaults.headers.Cookie = cookies;
      }
      return response;
    });

    let csrfToken = '';

    console.log('1. 获取CSRF令牌...');
    try {
      const csrfResponse = await client.get('/auth/me');
      csrfToken = csrfResponse.headers['x-csrf-token'];
      console.log('获取CSRF令牌成功:', csrfToken);
    } catch (error) {
      // 即使未登录，也能从响应头中获取CSRF令牌
      csrfToken = error.response?.headers['x-csrf-token'];
      console.log('从未登录响应中获取CSRF令牌成功:', csrfToken);
    }

    console.log('\n2. 登录测试账号...');
    const loginResponse = await client.post('/auth/login', {
      email: 'test@example.com',
      password: 'Password123!'
    }, {
      headers: {
        'X-CSRF-Token': csrfToken
      }
    });
    
    // 从登录响应中获取CSRF令牌
    csrfToken = loginResponse.headers['x-csrf-token'];
    console.log('登录成功:', loginResponse.data);
    console.log('获取CSRF令牌成功:', csrfToken);
    console.log('登录响应头:', loginResponse.headers);
    console.log('客户端cookie:', client.defaults.headers.Cookie);

    console.log('\n3. 尝试添加AI提供商...');
    const addProviderResponse = await client.post('/ai-providers', {
      name: 'Test Provider',
      type: 'openai',
      api_key: 'test-api-key',
      enabled: true
    }, {
      headers: {
        'X-CSRF-Token': csrfToken
      }
    });
    console.log('添加AI提供商成功:', addProviderResponse.data);

    console.log('\n✅ 测试通过！CSRF修复有效');
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.headers) {
      console.log('响应头:', error.response.headers);
    }
  }
}

testCsrfFix();
