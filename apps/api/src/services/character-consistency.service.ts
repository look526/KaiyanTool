import { prisma } from '../lib/prisma'
import logger from '../lib/logger'

/**
 * 角色一致性服务
 * 管理角色参考图，在分镜生成时自动注入角色外观信息
 */

interface CharacterRefData {
  character_id: string
  reference_images: string[]
  appearance: string
  name: string
}

/**
 * @description 获取角色的完整一致性数据（参考图 + 外观描述）
 */
export async function getCharacterConsistencyData(character_id: string): Promise<CharacterRefData | null> {
  const character = await prisma.character.findUnique({
    where: { id: character_id },
    include: { Wardrobe: true },
  })

  if (!character) return null

  return {
    character_id: character.id,
    reference_images: character.reference_images,
    appearance: character.appearance,
    name: character.name,
  }
}

/**
 * @description 为 Shot 构建包含角色一致性信息的图像生成参数
 */
export async function buildConsistencyParams(shot_id: string): Promise<{
  image_urls: string[]
  appearance_prompt: string
} | null> {
  const shot = await prisma.shot.findUnique({
    where: { id: shot_id },
    include: {
      Character: { include: { Wardrobe: true } },
      Scene: true,
    },
  })

  if (!shot?.Character) return null

  const character = shot.Character
  const imageUrls = character.reference_images.filter(url => url && url.length > 0)
  const appearanceParts: string[] = []

  if (character.name) {
    appearanceParts.push(`角色「${character.name}」`)
  }
  if (character.appearance) {
    appearanceParts.push(character.appearance)
  }
  if (character.gender) {
    appearanceParts.push(character.gender === 'male' ? '男性' : character.gender === 'female' ? '女性' : character.gender)
  }
  if (character.age) {
    appearanceParts.push(`${character.age}岁左右`)
  }

  const activeWardrobe = character.Wardrobe?.[0]
  if (activeWardrobe?.description) {
    appearanceParts.push(`穿着: ${activeWardrobe.description}`)
  }

  return {
    image_urls: imageUrls,
    appearance_prompt: appearanceParts.join('，'),
  }
}

/**
 * @description 增强图像生成的 Prompt，注入角色外观描述
 */
export function enhancePromptWithCharacter(originalPrompt: string, appearancePrompt: string): string {
  if (!appearancePrompt) return originalPrompt
  return `${originalPrompt}\n\n【角色外观参考】${appearancePrompt}`
}

/**
 * @description 批量获取多个角色的一致性数据（用于多角色场景）
 */
export async function getMultiCharacterData(character_ids: string[]): Promise<CharacterRefData[]> {
  const characters = await prisma.character.findMany({
    where: { id: { in: character_ids } },
    include: { Wardrobe: true },
  })

  return characters.map(c => ({
    character_id: c.id,
    reference_images: c.reference_images,
    appearance: c.appearance,
    name: c.name,
  }))
}

/**
 * @description 更新角色参考图
 */
export async function updateCharacterReferenceImages(
  character_id: string,
  reference_images: string[]
) {
  const updated = await prisma.character.update({
    where: { id: character_id },
    data: { reference_images, updated_at: new Date() },
  })
  logger.info('角色参考图已更新', { character_id, image_count: reference_images.length })
  return updated
}

/**
 * @description 添加单张参考图到角色
 */
export async function addReferenceImage(character_id: string, image_url: string) {
  const character = await prisma.character.findUnique({ where: { id: character_id } })
  if (!character) throw new Error('角色不存在')

  const images = [...character.reference_images, image_url]
  return updateCharacterReferenceImages(character_id, images)
}

/**
 * @description 删除单张参考图
 */
export async function removeReferenceImage(character_id: string, image_url: string) {
  const character = await prisma.character.findUnique({ where: { id: character_id } })
  if (!character) throw new Error('角色不存在')

  const images = character.reference_images.filter(url => url !== image_url)
  return updateCharacterReferenceImages(character_id, images)
}
