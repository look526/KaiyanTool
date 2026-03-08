import { ZhipuProvider } from './src/services/ai/zhipu.provider'

async function testZhipuAPI() {
  const apiKey = '16fb13b00c...' // 从数据库获取的 API Key 前缀
  const baseUrl = 'https://open.bigmodel.cn/api/coding/paas/v4'
  
  console.log('测试智谱 AI API...')
  console.log('Base URL:', baseUrl)
  console.log('API Key:', apiKey)
  
  try {
    const provider = new ZhipuProvider(apiKey, baseUrl)
    
    const response = await provider.chat([
      {
        role: 'user',
        content: '你好，请回复"测试成功"四个字',
      }
    ])
    
    console.log('\n✅ API 测试成功！')
    console.log('响应内容:', response.content)
    console.log('使用的模型:', response.model)
    console.log('Token 使用:', response.usage)
  } catch (error) {
    console.error('\n❌ API 测试失败！')
    console.error('错误信息:', error instanceof Error ? error.message : error)
    
    // 检查是否是认证错误
    if (error instanceof Error && error.message.includes('令牌已过期或验证不正确')) {
      console.log('\n🔍 诊断结果:')
      console.log('   - API Key 可能已过期')
      console.log('   - API Key 可能无效')
      console.log('   - API Key 可能不匹配当前 Base URL')
      console.log('\n💡 建议:')
      console.log('   1. 访问 https://open.bigmodel.cn/ 检查 API Key 状态')
      console.log('   2. 确认 API Key 是否已启用')
      console.log('   3. 确认 API Key 的权限是否包含聊天功能')
      console.log('   4. 如果需要，生成新的 API Key')
    }
  }
}

testZhipuAPI()
