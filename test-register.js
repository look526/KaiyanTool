const axios = require('axios');

async function registerTestUser() {
  try {
    const baseUrl = 'http://localhost:3001/api';
    const client = axios.create({
      baseURL: baseUrl,
      withCredentials: true
    });

    console.log('注册测试账号...');
    const registerResponse = await client.post('/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!'
    });
    
    console.log('注册成功:', registerResponse.data);
  } catch (error) {
    console.error('注册失败:', error.response?.data || error.message);
  }
}

registerTestUser();
