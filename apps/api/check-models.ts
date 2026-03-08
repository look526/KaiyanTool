import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('\n=== 查询 AI 提供商和模型信息 ===\n')

    // 查询所有启用的提供商
    const providers = await prisma.aIProvider.findMany({
      where: { enabled: true },
      include: {
        AIProviderModel: true,
      },
    })

    console.log(`找到 ${providers.length} 个启用的提供商:\n`)

    for (const provider of providers) {
      console.log(`📦 提供商 ID: ${provider.id}`)
      console.log(`   类型: ${provider.type}`)
      console.log(`   Base URL: ${provider.base_url || '未设置'}`)
      console.log(`   API Key: ${provider.api_key ? provider.api_key.substring(0, 10) + '...' : '未设置'}`)
      console.log(`   模型数量: ${provider.AIProviderModel.length}`)
      
      if (provider.AIProviderModel.length > 0) {
        console.log(`   模型列表:`)
        for (const model of provider.AIProviderModel) {
          console.log(`      - ${model.name} (ID: ${model.id})`)
          console.log(`        类型: ${model.types?.join(', ') || '未设置'}`)
          console.log(`        默认助手: ${model.isAssistantDefault ? '是' : '否'}`)
        }
      }
      console.log('')
    }

    // 查询用户偏好设置
    const userPrefs = await prisma.userPreferences.findMany()
    console.log('\n=== 用户模型偏好设置 ===\n')
    for (const pref of userPrefs) {
      console.log(`用户 ID: ${pref.user_id}`)
      console.log(`默认模型:`, pref.default_models)
      console.log(`最近使用:`, pref.last_used_models)
      console.log('')
    }

    // 查询特定的模型 ID
    const modelId = '62c91843-a2b0-4257-86f2-f23035d02d10'
    const model = await prisma.aIProviderModel.findUnique({
      where: { id: modelId },
      include: {
        provider: true,
      },
    })

    if (model) {
      console.log('=== 当前使用的模型 ===\n')
      console.log(`模型名称: ${model.name}`)
      console.log(`模型 ID: ${model.id}`)
      console.log(`类型: ${model.types?.join(', ')}`)
      console.log(`提供商 ID: ${model.provider.id}`)
      console.log(`提供商类型: ${model.provider.type}`)
      console.log(`提供商 API Key: ${model.provider.api_key ? model.provider.api_key.substring(0, 10) + '...' : '未设置'}`)
      console.log(`提供商 Base URL: ${model.provider.base_url || '未设置'}`)
    } else {
      console.log(`未找到模型 ID: ${modelId}`)
    }

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
